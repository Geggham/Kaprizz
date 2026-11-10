import "server-only";

import { Prisma, type ProductVariant, type Prisma as PrismaTypes } from "@/generated/prisma/client";
import { badRequest, conflict, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import type {
  AdminProductInput,
  AdminProductInventoryInput,
} from "@/lib/validation/admin-products";

const productReadInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  colors: {
    where: { variants: { some: { isActive: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  sizes: { orderBy: { size: "asc" as const } },
  variants: {
    where: { isActive: true },
    orderBy: [{ colorId: "asc" as const }, { size: "asc" as const }],
  },
};

const productWriteInclude = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  colors: { orderBy: { createdAt: "asc" as const } },
  sizes: { orderBy: { size: "asc" as const } },
  variants: {
    orderBy: [{ colorId: "asc" as const }, { size: "asc" as const }],
  },
};

export type AdminProduct = PrismaTypes.ProductGetPayload<{ include: typeof productReadInclude }>;
type ProductForSynchronization = PrismaTypes.ProductGetPayload<{
  include: typeof productWriteInclude;
}>;

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" as const }, take: 1 },
      category: true,
      _count: { select: { variants: true } },
      variants: { select: { stock: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return products.map(({ variants, ...product }) => ({
    ...product,
    totalStock: variants.reduce((total, variant) => total + variant.stock, 0),
  }));
}

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  return prisma.product.findUnique({ where: { id }, include: productReadInclude });
}

async function assertCategory(
  tx: PrismaTypes.TransactionClient,
  input: AdminProductInput,
) {
  const category = await tx.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw badRequest("Selected category does not exist");
  if (category.model !== input.model) {
    throw badRequest("Selected category must match the product model");
  }
}

function sizeAvailability(
  variants: ReadonlyArray<Pick<ProductVariant, "size" | "isActive" | "stock">>,
  size: number,
) {
  return variants.some(
    (variant) => variant.size === size && variant.isActive && variant.stock > 0,
  );
}

async function synchronizeSizeAvailability(
  tx: PrismaTypes.TransactionClient,
  productId: string,
  sizes: readonly number[],
  variants: ReadonlyArray<Pick<ProductVariant, "size" | "isActive" | "stock">>,
) {
  await Promise.all(
    sizes.map((size) =>
      tx.productSize.upsert({
        where: { productId_size: { productId, size } },
        create: { productId, size, available: sizeAvailability(variants, size) },
        update: { available: sizeAvailability(variants, size) },
      }),
    ),
  );
}

async function archiveOrDeleteRemovedVariants(
  tx: PrismaTypes.TransactionClient,
  variantIds: readonly string[],
) {
  if (!variantIds.length) return;

  const variants = await tx.productVariant.findMany({
    where: { id: { in: [...variantIds] } },
    select: {
      id: true,
      cartItems: { select: { id: true } },
      orderItems: { select: { id: true } },
    },
  });
  const referencedIds = variants
    .filter((variant) => variant.cartItems.length > 0 || variant.orderItems.length > 0)
    .map((variant) => variant.id);
  const deletableIds = variants
    .filter((variant) => !referencedIds.includes(variant.id))
    .map((variant) => variant.id);

  if (referencedIds.length) {
    await tx.productVariant.updateMany({
      where: { id: { in: referencedIds } },
      data: { isActive: false, stock: 0 },
    });
  }
  if (deletableIds.length) {
    await tx.productVariant.deleteMany({ where: { id: { in: deletableIds } } });
  }
}

async function synchronizeProduct(
  tx: PrismaTypes.TransactionClient,
  productId: string,
  input: AdminProductInput,
  existing?: ProductForSynchronization,
) {
  await assertCategory(tx, input);

  const slugOwner = await tx.product.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (slugOwner && slugOwner.id !== productId) {
    throw conflict("A product already uses this slug");
  }

  await tx.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      price: input.price,
      gender: input.gender,
      model: input.model,
      categoryId: input.categoryId,
      isActive: input.isActive,
      isNew: input.isNew,
      isBestSeller: input.isBestSeller,
      isFeatured: input.isFeatured,
    },
  });

  await tx.productImage.deleteMany({ where: { productId } });
  if (input.images.length) {
    await tx.productImage.createMany({
      data: input.images.map(({ url, alt, position }) => ({ productId, url, alt, position })),
    });
  }

  const incomingPersistedColorIds = new Set(
    input.colors.flatMap((color) => (color.persistedId ? [color.persistedId] : [])),
  );
  const currentColors = existing?.colors ?? [];

  for (const color of input.colors) {
    if (!color.persistedId) continue;
    if (!currentColors.some((current) => current.id === color.persistedId)) {
      throw badRequest("A color does not belong to this product");
    }
    await tx.productColor.update({
      where: { id: color.persistedId },
      data: { name: color.name, hex: color.hex },
    });
  }

  const newColors = input.colors.filter((color) => !color.persistedId);
  const createdColors = await Promise.all(
    newColors.map((color) =>
      tx.productColor.create({
        data: { productId, name: color.name, hex: color.hex },
        select: { id: true },
      }),
    ),
  );
  const colorIdByEditorId = new Map<string, string>();
  input.colors.forEach((color) => {
    if (color.persistedId) colorIdByEditorId.set(color.id, color.persistedId);
  });
  newColors.forEach((color, index) => {
    colorIdByEditorId.set(color.id, createdColors[index].id);
  });

  const removedColorIds = currentColors
    .filter((color) => !incomingPersistedColorIds.has(color.id))
    .map((color) => color.id);
  const currentSizes = new Set((existing?.sizes ?? []).map((size) => size.size));
  const requestedSizes = new Set(input.sizes);
  const removedSizes = [...currentSizes].filter((size) => !requestedSizes.has(size));
  if (removedSizes.length) {
    await tx.productSize.deleteMany({ where: { productId, size: { in: removedSizes } } });
  }

  const currentVariants = new Map((existing?.variants ?? []).map((variant) => [variant.id, variant]));
  const submittedVariantIds = new Set(input.variants.flatMap((variant) => (variant.id ? [variant.id] : [])));

  for (const variant of input.variants) {
    const colorId = colorIdByEditorId.get(variant.colorId);
    if (!colorId) throw badRequest("Variant references an unknown color");

    const data = {
      colorId,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      isActive: variant.isActive,
      priceOverride: variant.priceOverride,
    };

    if (variant.id) {
      if (!currentVariants.has(variant.id)) {
        throw badRequest("A variant does not belong to this product");
      }
      await tx.productVariant.update({ where: { id: variant.id }, data });
    } else {
      await tx.productVariant.create({ data: { productId, ...data } });
    }
  }

  const removedVariantIds = [...currentVariants.keys()].filter((id) => !submittedVariantIds.has(id));
  await archiveOrDeleteRemovedVariants(tx, removedVariantIds);

  if (removedColorIds.length) {
    await tx.productColor.deleteMany({
      where: {
        id: { in: removedColorIds },
        variants: { none: {} },
      },
    });
  }

  await synchronizeSizeAvailability(tx, productId, input.sizes, input.variants);

  return tx.product.findUniqueOrThrow({ where: { id: productId }, include: productReadInclude });
}

async function withProductWriteConflict<T>(work: () => Promise<T>) {
  try {
    return await work();
  } catch (error) {
    const constraintTarget =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? Array.isArray(error.meta?.target)
          ? error.meta.target.join(",")
          : String(error.meta?.target ?? "")
        : "";
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      constraintTarget.toLowerCase().includes("sku")
    ) {
      throw conflict("A product variant already uses this SKU");
    }
    throw error;
  }
}

export async function createAdminProduct(input: AdminProductInput) {
  return withProductWriteConflict(() => prisma.$transaction(async (tx) => {
    await assertCategory(tx, input);
    const product = await tx.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        price: input.price,
        gender: input.gender,
        model: input.model,
        categoryId: input.categoryId,
        isActive: input.isActive,
        isNew: input.isNew,
        isBestSeller: input.isBestSeller,
        isFeatured: input.isFeatured,
      },
    });
    return synchronizeProduct(tx, product.id, input);
  }));
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  return withProductWriteConflict(() => prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id }, include: productWriteInclude });
    if (!existing) throw notFound("Product not found");
    return synchronizeProduct(tx, id, input, existing);
  }));
}

export async function updateAdminProductInventory(
  id: string,
  input: AdminProductInventoryInput,
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { sizes: { select: { size: true } }, variants: true },
    });
    if (!product) throw notFound("Product not found");

    const existingVariantIds = new Set(product.variants.map((variant) => variant.id));
    if (input.variants.some((variant) => !existingVariantIds.has(variant.id))) {
      throw badRequest("A variant does not belong to this product");
    }

    await Promise.all(
      input.variants.map((variant) =>
        tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock, isActive: variant.isActive },
        }),
      ),
    );
    const variants = product.variants.map((variant) => {
      const update = input.variants.find((item) => item.id === variant.id);
      return update ? { ...variant, ...update } : variant;
    });
    await synchronizeSizeAvailability(
      tx,
      id,
      product.sizes.map((size) => size.size),
      variants,
    );

    return tx.product.findUniqueOrThrow({ where: { id }, include: productReadInclude });
  });
}

export async function deleteAdminProduct(id: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id },
      include: { variants: { select: { id: true } } },
    });
    if (!product) throw notFound("Product not found");

    const variantIds = product.variants.map((variant) => variant.id);
    const [orderItems, personalisationRequests, cartItems] = await Promise.all([
      tx.orderItem.count({ where: { productId: id } }),
      tx.personalisationRequest.count({ where: { productId: id } }),
      variantIds.length ? tx.cartItem.count({ where: { variantId: { in: variantIds } } }) : 0,
    ]);

    if (orderItems || personalisationRequests || cartItems) {
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: { isActive: false, stock: 0 },
      });
      await tx.product.update({ where: { id }, data: { isActive: false } });
      return { deleted: false, archived: true };
    }

    await tx.product.delete({ where: { id } });
    return { deleted: true, archived: false };
  });
}
