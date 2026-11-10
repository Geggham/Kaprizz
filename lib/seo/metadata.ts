import type { Metadata } from "next";
import { absoluteAssetUrl, absoluteUrl, siteConfig } from "@/lib/seo/site-config";

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  robots?: Metadata["robots"];
  absoluteTitle?: boolean;
};

export type ProductSeoSource = {
  name: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  image?: string | null;
  category: "men" | "women";
  slug: string;
};

export type CategorySeoSource = {
  heading: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  path: string;
  image?: string | null;
};

/**
 * Facet/filter query combinations are never indexable.
 * Core category/product URLs remain indexable; temporary filter state stays client-only.
 */
export const facetIndexingPolicy = {
  indexFacetUrls: false,
  canonicalTarget: "primary-category-or-product" as const,
  includeInSitemap: false,
} as const;

export function getCanonicalUrl(path: string): string {
  return absoluteUrl(path);
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const canonical = getCanonicalUrl(input.path);
  const image = input.image ? absoluteAssetUrl(input.image) : undefined;

  return {
    title: input.absoluteTitle
      ? { absolute: input.title }
      : input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    robots: input.robots,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: input.title,
      description: input.description,
      url: canonical,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export function getProductMetadata(product: ProductSeoSource): Metadata {
  const title = product.seoTitle?.trim() || product.name;
  const description =
    product.seoDescription?.trim() ||
    `Discover the Kapriz ${product.name}. ${product.description}`.slice(0, 300);
  const path = `/${product.category}/${product.slug}`;

  return buildPageMetadata({
    title,
    description,
    path,
    image: product.image,
  });
}

export function getCategoryMetadata(category: CategorySeoSource): Metadata {
  return buildPageMetadata({
    title: category.seoTitle?.trim() || category.heading,
    description: category.seoDescription?.trim() || category.description,
    path: category.path,
    image: category.image,
  });
}

export function buildNoIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}
