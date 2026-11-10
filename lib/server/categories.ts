import "server-only";

import type { Gender, ProductModel } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/server/safe-query";

export type CategorySeoView = {
  id: string;
  name: string;
  slug: string;
  model: ProductModel;
  seoTitle: string | null;
  seoDescription: string | null;
  seoHeading: string | null;
  intro: string | null;
  editorialContent: string | null;
  updatedAt: Date;
};

export async function getCategoryBySlug(
  slug: string,
): Promise<CategorySeoView | null> {
  return safeQuery(null, async () => {
    return prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        model: true,
        seoTitle: true,
        seoDescription: true,
        seoHeading: true,
        intro: true,
        editorialContent: true,
        updatedAt: true,
      },
    });
  });
}

export async function listCategoriesWithActiveProducts(
  gender: Gender,
): Promise<CategorySeoView[]> {
  return safeQuery([], async () => {
    return prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            gender,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        model: true,
        seoTitle: true,
        seoDescription: true,
        seoHeading: true,
        intro: true,
        editorialContent: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });
  });
}

export async function countActiveProductsForCategory(
  gender: Gender,
  model: ProductModel,
): Promise<number> {
  return safeQuery(0, async () =>
    prisma.product.count({
      where: {
        isActive: true,
        gender,
        model,
      },
    }),
  );
}
