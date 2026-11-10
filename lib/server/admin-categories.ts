import "server-only";

import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import type { AdminCategorySeoInput } from "@/lib/validation/admin-categories";

export async function listAdminCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      model: true,
      seoHeading: true,
      intro: true,
      editorialContent: true,
      seoTitle: true,
      seoDescription: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function updateAdminCategorySeo(id: string, data: AdminCategorySeoInput) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!category) throw notFound("Category not found");

  return prisma.category.update({ where: { id }, data });
}
