import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { badRequest, conflict, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import type { CheckoutInput } from "@/lib/validation/checkout";

type CartLine = { variantId: string; quantity: number };
type CheckoutUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function mergeCartLines(items: CartLine[]) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  }
  return [...quantities].map(([variantId, quantity]) => ({ variantId, quantity }));
}

function asMoney(value: Prisma.Decimal) {
  return value.toNumber();
}

function makeConfirmationToken() {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: createHash("sha256").update(raw).digest("hex") };
}

function makeOrderNumber() {
  return `KAP-${new Date().getUTCFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function getCartLines(userId: string): Promise<CartLine[]> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { items: { select: { variantId: true, quantity: true } } },
  });
  return cart?.items ?? [];
}

async function getCheckoutData(
  lines: CartLine[],
  countryCode: string,
  db: Pick<typeof prisma, "productVariant" | "shippingCountry"> = prisma,
) {
  const items = mergeCartLines(lines);
  if (items.length === 0) throw badRequest("Cart is empty");

  const [country, variants] = await Promise.all([
    db.shippingCountry.findFirst({
      where: { code: countryCode, isActive: true },
    }),
    db.productVariant.findMany({
      where: { id: { in: items.map((item) => item.variantId) } },
      include: { product: true, color: true },
    }),
  ]);

  if (!country) throw badRequest("Shipping is not available for this country");
  if (variants.length !== items.length) throw badRequest("One or more cart items are unavailable");

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const resolvedItems = items.map((item) => {
    const variant = variantsById.get(item.variantId);
    if (!variant || !variant.isActive || !variant.product.isActive) {
      throw badRequest("One or more cart items are unavailable");
    }
    if (variant.stock < item.quantity) {
      throw badRequest(`Insufficient stock for ${variant.product.name}`);
    }
    const unitPrice = variant.priceOverride ?? variant.product.price;
    return {
      ...item,
      variant,
      unitPrice,
      totalPrice: unitPrice.mul(item.quantity),
    };
  });

  const subtotal = resolvedItems.reduce(
    (sum, item) => sum.add(item.totalPrice),
    new Prisma.Decimal(0),
  );
  const shippingCost = country.shippingPrice;

  return {
    country,
    items: resolvedItems,
    subtotal,
    shippingCost,
    total: subtotal.add(shippingCost),
  };
}

function presentSummary(summary: Awaited<ReturnType<typeof getCheckoutData>>) {
  return {
    items: summary.items.map((item) => ({
      variantId: item.variant.id,
      productId: item.variant.productId,
      sku: item.variant.sku,
      productName: item.variant.product.name,
      colorName: item.variant.color.name,
      size: item.variant.size,
      quantity: item.quantity,
      unitPrice: asMoney(item.unitPrice),
      totalPrice: asMoney(item.totalPrice),
    })),
    subtotal: asMoney(summary.subtotal),
    shippingCost: asMoney(summary.shippingCost),
    total: asMoney(summary.total),
    currency: "USD" as const,
    deliveryOptions: [{
      id: "standard" as const,
      name: "Standard delivery",
      price: asMoney(summary.shippingCost),
      estimatedMinDays: summary.country.estimatedMinDays,
      estimatedMaxDays: summary.country.estimatedMaxDays,
    }],
  };
}

export async function getCheckoutSummary(input: {
  countryCode: string;
  userId?: string;
  cartItems?: CartLine[];
}) {
  const lines = input.userId
    ? await getCartLines(input.userId)
    : mergeCartLines(input.cartItems ?? []);
  return presentSummary(await getCheckoutData(lines, input.countryCode));
}

function presentOrder(order: {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  total: Prisma.Decimal;
  currency: string;
  createdAt: Date;
  customerEmail: string;
  shippingCity: string;
  shippingCountryName: string;
  shippingEstimatedMinDays: number;
  shippingEstimatedMaxDays: number;
  items: Array<{
    sku: string | null;
    productName: string;
    colorName: string;
    size: number;
    quantity: number;
    unitPrice: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
  }>;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: asMoney(order.subtotal),
    shippingCost: asMoney(order.shippingCost),
    total: asMoney(order.total),
    currency: order.currency,
    createdAt: order.createdAt,
    email: order.customerEmail,
    city: order.shippingCity,
    country: order.shippingCountryName,
    estimatedMinDays: order.shippingEstimatedMinDays,
    estimatedMaxDays: order.shippingEstimatedMaxDays,
    items: order.items.map((item) => ({
      sku: item.sku,
      productName: item.productName,
      colorName: item.colorName,
      size: item.size,
      quantity: item.quantity,
      unitPrice: asMoney(item.unitPrice),
      totalPrice: asMoney(item.totalPrice),
    })),
  };
}

export async function createCheckoutOrder(input: CheckoutInput, user: CheckoutUser | null) {
  if (!user && !input.contact) throw badRequest("Contact details are required for guest checkout");
  const lines = user ? await getCartLines(user.id) : mergeCartLines(input.cartItems ?? []);
  const contact = input.contact ?? {
    firstName: user!.firstName,
    lastName: user!.lastName,
    email: user!.email,
    phone: input.shippingAddress.phone,
  };
  const customerEmail = contact.email.toLowerCase();

  const existing = await prisma.order.findUnique({
    where: { clientRequestId: input.clientRequestId },
    include: { items: true },
  });
  if (existing) {
    if (existing.userId !== user?.id || (!user && existing.customerEmail !== customerEmail)) {
      throw conflict("Idempotency token has already been used");
    }
    return { order: presentOrder(existing), confirmationToken: undefined, reused: true };
  }

  const token = makeConfirmationToken();
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
      const prior = await tx.order.findUnique({
        where: { clientRequestId: input.clientRequestId },
        include: { items: true },
      });
      if (prior) {
        if (prior.userId !== user?.id || (!user && prior.customerEmail !== customerEmail)) {
          throw conflict("Idempotency token has already been used");
        }
        return { order: presentOrder(prior), confirmationToken: undefined, reused: true };
      }

      const summary = await getCheckoutData(lines, input.countryCode, tx);
      let shippingAddressId: string | undefined;
      if (user && input.saveAddress) {
        const address = await tx.address.create({
          data: { userId: user.id, ...input.shippingAddress },
        });
        shippingAddressId = address.id;
      }

        const order = await tx.order.create({
            data: {
              orderNumber: makeOrderNumber(),
              userId: user?.id,
              guestEmail: user ? null : customerEmail,
              customerEmail,
              customerFirstName: contact.firstName,
              customerLastName: contact.lastName,
              customerPhone: contact.phone,
              clientRequestId: input.clientRequestId,
              confirmationTokenHash: token.hash,
              confirmationTokenExpiresAt: expiresAt,
              status: "PENDING",
              paymentStatus: "UNPAID",
              subtotal: summary.subtotal,
              shippingCost: summary.shippingCost,
              total: summary.total,
              shippingAddressId,
              shippingFirstName: input.shippingAddress.firstName,
              shippingLastName: input.shippingAddress.lastName,
              shippingCountry: input.shippingAddress.country,
              shippingCity: input.shippingAddress.city,
              shippingAddressLine1: input.shippingAddress.addressLine1,
              shippingAddressLine2: input.shippingAddress.addressLine2 ?? "",
              shippingPostalCode: input.shippingAddress.postalCode,
              shippingPhone: input.shippingAddress.phone,
              shippingCountryCode: summary.country.code,
              shippingCountryName: summary.country.name,
              shippingMethodName: "standard",
              shippingEstimatedMinDays: summary.country.estimatedMinDays,
              shippingEstimatedMaxDays: summary.country.estimatedMaxDays,
              items: {
                create: summary.items.map((item) => ({
                  productId: item.variant.productId,
                  variantId: item.variant.id,
                  sku: item.variant.sku,
                  productName: item.variant.product.name,
                  colorName: item.variant.color.name,
                  size: item.variant.size,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                })),
              },
            },
            include: { items: true },
        });

        // UNPAID/PENDING orders do not reserve or decrement inventory. Payment
        // capture/finalisation owns stock mutation so abandoned checkouts cannot oversell locks.
        if (user) {
          const cart = await tx.cart.findUnique({ where: { userId: user.id } });
          if (cart) await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return { order: presentOrder(order), confirmationToken: token.raw, reused: false };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const racedOrder = await prisma.order.findUnique({
          where: { clientRequestId: input.clientRequestId },
          include: { items: true },
        });
        if (racedOrder && racedOrder.userId === user?.id && (user || racedOrder.customerEmail === customerEmail)) {
          return { order: presentOrder(racedOrder), confirmationToken: undefined, reused: true };
        }
        if (attempt < 4) continue;
      }
      throw error;
    }
  }
  throw conflict("Could not allocate a unique order number");
}

export async function getGuestOrderStatus(orderNumber: string, email: string) {
  const order = await prisma.order.findFirst({
    where: { orderNumber, customerEmail: email.toLowerCase() },
    select: { orderNumber: true, status: true, paymentStatus: true, createdAt: true },
  });
  // Keep this response neutral to prevent order-number enumeration.
  return order ?? null;
}

export async function getConfirmationOrder(input: {
  orderNumber: string;
  userId?: string;
  confirmationToken?: string;
}) {
  const tokenHash = input.confirmationToken
    ? createHash("sha256").update(input.confirmationToken).digest("hex")
    : undefined;
  const order = await prisma.order.findFirst({
    where: input.userId
      ? { orderNumber: input.orderNumber, userId: input.userId }
      : {
          orderNumber: input.orderNumber,
          confirmationTokenHash: tokenHash,
          confirmationTokenExpiresAt: { gt: new Date() },
        },
    include: { items: true },
  });
  if (!order) throw notFound("Order not found");
  return presentOrder(order);
}

// Email delivery is intentionally owned by a caller/job, not checkout creation.
export function getCheckoutNotificationPayload(order: Awaited<ReturnType<typeof createCheckoutOrder>>["order"]) {
  return { orderNumber: order.orderNumber, status: order.status };
}
