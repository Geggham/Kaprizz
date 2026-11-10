import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { genderToCategory } from "@/lib/mappers/product";
import { absoluteUrl } from "@/lib/seo/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/men",
    "/women",
    "/about",
    "/personalisation",
    "/shipping",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    changeFrequency: path === "" ? "weekly" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        gender: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: {
        products: {
          some: { isActive: true },
        },
      },
      select: {
        slug: true,
        updatedAt: true,
        products: {
          where: { isActive: true },
          select: { gender: true },
          distinct: ["gender"],
        },
      },
    }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/${genderToCategory(product.gender)}/${product.slug}`),
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const styleEntries: MetadataRoute.Sitemap = categories.flatMap((category) =>
    category.products.map((product) => ({
      url: absoluteUrl(
        `/${genderToCategory(product.gender)}/styles/${category.slug}`,
      ),
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  );

  return [...staticRoutes, ...styleEntries, ...productEntries];
}
