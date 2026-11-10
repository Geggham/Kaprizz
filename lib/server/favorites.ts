import "server-only";

import { conflict, notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { mapDbProductToView } from "@/lib/mappers/product";

export async function listFavoriteProductIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
    orderBy: { createdAt: "desc" },
  });
  return favorites.map((favorite) => favorite.productId);
}

export async function listFavoriteProducts(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" } },
          colors: true,
          sizes: { orderBy: { size: "asc" } },
          variants: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return favorites
    .filter((favorite) => favorite.product.isActive)
    .map((favorite) => mapDbProductToView(favorite.product));
}

export async function addFavorite(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });
  if (!product) {
    throw notFound("Product not found");
  }

  try {
    await prisma.favorite.create({
      data: { userId, productId },
    });
  } catch {
    throw conflict("Product is already in favorites");
  }

  return listFavoriteProductIds(userId);
}

export async function removeFavorite(userId: string, productId: string) {
  await prisma.favorite.deleteMany({
    where: { userId, productId },
  });
  return listFavoriteProductIds(userId);
}
