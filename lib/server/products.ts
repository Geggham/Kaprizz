import "server-only";

import type { Gender, Prisma, ProductModel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  categoryToGender,
  mapDbProductToView,
} from "@/lib/mappers/product";
import { safeQuery } from "@/lib/server/safe-query";
import type { Product, ProductCategory } from "@/types";

const productInclude = {
  images: { orderBy: { position: "asc" as const } },
  colors: { where: { variants: { some: { isActive: true } } } },
  sizes: { orderBy: { size: "asc" as const } },
  variants: { where: { isActive: true } },
  category: true,
};

export type ProductListParams = {
  gender?: Gender;
  model?: ProductModel;
  color?: string;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  sort?: "featured" | "newest" | "priceAsc" | "priceDesc";
  page?: number;
  limit?: number;
};

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (params.gender) where.gender = params.gender;
  if (params.model) where.model = params.model;
  if (params.isNew !== undefined) where.isNew = params.isNew;
  if (params.isBestSeller !== undefined) where.isBestSeller = params.isBestSeller;
  if (params.isFeatured !== undefined) where.isFeatured = params.isFeatured;

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) where.price.gte = params.minPrice;
    if (params.maxPrice !== undefined) where.price.lte = params.maxPrice;
  }

  if (params.color) {
    where.variants = {
      some: {
        isActive: true,
        color: {
          OR: [
            { name: { equals: params.color, mode: "insensitive" } },
            { id: params.color },
          ],
        },
      },
    };
  }

  if (params.size !== undefined) {
    where.sizes = {
      some: {
        size: params.size,
        available: true,
      },
    };
  }

  return where;
}

function buildOrderBy(
  sort: ProductListParams["sort"],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "priceAsc":
      return [{ price: "asc" }];
    case "priceDesc":
      return [{ price: "desc" }];
    case "featured":
    default:
      return [{ isBestSeller: "desc" }, { isNew: "desc" }, { createdAt: "desc" }];
  }
}

export async function listProducts(params: ProductListParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 24;
  const empty = {
    items: [] as Product[],
    page,
    limit,
    total: 0,
    totalPages: 1,
  };

  return safeQuery(empty, async () => {
    const skip = (page - 1) * limit;
    const where = buildWhere(params);

    const [total, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: buildOrderBy(params.sort),
        skip,
        take: limit,
      }),
    ]);

    return {
      items: rows.map(mapDbProductToView),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  });
}

export async function getActiveProducts(): Promise<Product[]> {
  return safeQuery([], async () => {
    const rows = await prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapDbProductToView);
  });
}

export async function getProductsByGender(gender: Gender): Promise<Product[]> {
  const result = await listProducts({ gender, limit: 60 });
  return result.items;
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  return getProductsByGender(categoryToGender(category));
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const result = await listProducts({
    isFeatured: true,
    sort: "featured",
    limit,
  });
  return result.items;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return safeQuery(null, async () => {
    const row = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: productInclude,
    });
    return row ? mapDbProductToView(row) : null;
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  return safeQuery(null, async () => {
    const row = await prisma.product.findFirst({
      where: { id, isActive: true },
      include: productInclude,
    });
    return row ? mapDbProductToView(row) : null;
  });
}

export async function getProductsByModel(model: ProductModel): Promise<Product[]> {
  const result = await listProducts({ model, limit: 60 });
  return result.items;
}

export async function getRecommendedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  return safeQuery([], async () => {
    const candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        gender: categoryToGender(product.category),
      },
      include: productInclude,
      take: 40,
    });

    return candidates
      .map(mapDbProductToView)
      .sort((first, second) => {
        const firstScore =
          Number(first.model === product.model) * 3 +
          Number(
            first.colors.some((color) =>
              product.colors.some((productColor) => productColor.id === color.id),
            ),
          ) *
            2 -
          Math.abs(first.price - product.price) / 100;
        const secondScore =
          Number(second.model === product.model) * 3 +
          Number(
            second.colors.some((color) =>
              product.colors.some((productColor) => productColor.id === color.id),
            ),
          ) *
            2 -
          Math.abs(second.price - product.price) / 100;
        return secondScore - firstScore;
      })
      .slice(0, limit);
  });
}
