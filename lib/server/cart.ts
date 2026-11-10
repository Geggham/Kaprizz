import "server-only";

import { badRequest, notFound } from "@/lib/api/errors";
import { toNumber } from "@/lib/mappers/product";
import { prisma } from "@/lib/prisma";

export type CartViewItem = {
  id: string;
  variantId: string;
  productId: string;
  colorId: string;
  size: number;
  quantity: number;
  productName: string;
  colorName: string;
  image: string;
  unitPrice: number;
  currency: "USD";
  slug: string;
  category: "men" | "women";
  maxQuantity: number;
};

async function ensureCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

function mapCartItems(
  items: Array<{
    id: string;
    quantity: number;
    variant: {
      id: string;
      size: number;
      stock: number;
      priceOverride: { toString(): string } | null;
      color: { id: string; name: string };
      product: {
        id: string;
        name: string;
        slug: string;
        gender: "MEN" | "WOMEN";
        price: { toString(): string };
        images: Array<{ url: string }>;
      };
    };
  }>,
): CartViewItem[] {
  return items.map((item) => {
    const unitPrice = item.variant.priceOverride
      ? toNumber(item.variant.priceOverride)
      : toNumber(item.variant.product.price);

    return {
      id: item.id,
      variantId: item.variant.id,
      productId: item.variant.product.id,
      colorId: item.variant.color.id,
      size: item.variant.size,
      quantity: item.quantity,
      productName: item.variant.product.name,
      colorName: item.variant.color.name,
      image:
        item.variant.product.images[0]?.url ?? "/images/for-al-boxes.png",
      unitPrice,
      currency: "USD",
      slug: item.variant.product.slug,
      category: item.variant.product.gender === "MEN" ? "men" : "women",
      maxQuantity: item.variant.stock,
    };
  });
}

async function getCartView(userId: string): Promise<CartViewItem[]> {
  const cart = await ensureCart(userId);
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      variant: {
        include: {
          color: true,
          product: {
            include: {
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return mapCartItems(items);
}

async function resolveVariant(input: {
  variantId?: string;
  productId?: string;
  colorId?: string;
  size?: number;
}) {
  if (input.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: input.variantId,
        isActive: true,
        product: { isActive: true },
      },
      include: { product: true, color: true },
    });
    if (!variant) throw notFound("Variant not found");
    return variant;
  }

  if (!input.productId || !input.colorId || !input.size) {
    throw badRequest("Provide variantId or productId + colorId + size");
  }

  const variant = await prisma.productVariant.findFirst({
    where: {
      productId: input.productId,
      colorId: input.colorId,
      size: input.size,
      isActive: true,
      product: { isActive: true },
    },
    include: { product: true, color: true },
  });

  if (!variant) {
    throw notFound("Selected color and size are unavailable");
  }

  return variant;
}

export async function getCart(userId: string) {
  const items = await getCartView(userId);
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
  return { items, subtotal, currency: "USD" as const };
}

export async function addCartItem(
  userId: string,
  input: {
    variantId?: string;
    productId?: string;
    colorId?: string;
    size?: number;
    quantity: number;
  },
) {
  if (input.quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  const variant = await resolveVariant(input);
  if (variant.stock < input.quantity) {
    throw badRequest("Insufficient stock for selected variant");
  }

  const cart = await ensureCart(userId);
  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: variant.id,
      },
    },
  });

  const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (nextQuantity > variant.stock) {
    throw badRequest("Insufficient stock for selected variant");
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: variant.id,
        quantity: input.quantity,
      },
    });
  }

  return getCart(userId);
}

export async function updateCartItemQuantity(
  userId: string,
  variantId: string,
  quantity: number,
) {
  if (quantity < 1) {
    throw badRequest("Quantity must be greater than zero");
  }

  const cart = await ensureCart(userId);
  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    include: { variant: true },
  });

  if (!item) {
    throw notFound("Cart item not found");
  }

  if (!item.variant.isActive || item.variant.stock < quantity) {
    throw badRequest("Insufficient stock for selected variant");
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  return getCart(userId);
}

export async function removeCartItem(userId: string, variantId: string) {
  const cart = await ensureCart(userId);
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, variantId },
  });
  return getCart(userId);
}
