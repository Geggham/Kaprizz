import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogExperience } from "@/components/product/catalog-experience";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getTranslator } from "@/lib/i18n/get-translator";
import { categoryToGender } from "@/lib/mappers/product";
import {
  countActiveProductsForCategory,
  getCategoryBySlug,
} from "@/lib/server/categories";
import { listProducts } from "@/lib/server/products";
import { getCategoryMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import type { ProductCategory } from "@/types";

type StylePageProps = {
  params: Promise<{ category: string; modelSlug: string }>;
};

function isProductCategory(value: string): value is ProductCategory {
  return value === "men" || value === "women";
}

export async function generateMetadata({
  params,
}: StylePageProps): Promise<Metadata> {
  const { category, modelSlug } = await params;
  if (!isProductCategory(category)) {
    return {};
  }

  const gender = categoryToGender(category);
  const style = await getCategoryBySlug(modelSlug);
  if (!style) {
    return {};
  }

  const count = await countActiveProductsForCategory(gender, style.model);
  if (count === 0) {
    return {};
  }

  const heading =
    style.seoHeading?.trim() ||
    `${category === "men" ? "Men's" : "Women's"} ${style.name}`;

  return getCategoryMetadata({
    heading,
    description:
      style.intro?.trim() ||
      `Explore ${heading.toLowerCase()} by Kapriz.`,
    seoTitle: style.seoTitle,
    seoDescription: style.seoDescription,
    path: `/${category}/styles/${style.slug}`,
  });
}

export default async function StyleLandingPage({ params }: StylePageProps) {
  const { category, modelSlug } = await params;
  if (!isProductCategory(category)) {
    notFound();
  }

  const { t } = await getTranslator();
  const gender = categoryToGender(category);
  const style = await getCategoryBySlug(modelSlug);
  if (!style) {
    notFound();
  }

  const listing = await listProducts({
    gender,
    model: style.model,
    limit: 60,
  });

  if (listing.total === 0) {
    notFound();
  }

  const heading =
    style.seoHeading?.trim() ||
    `${category === "men" ? "Men's" : "Women's"} ${style.name}`;
  const categoryLabel = t(
    category === "men" ? "pages.menTitle" : "pages.womenTitle",
  );
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: categoryLabel, path: `/${category}` },
    { name: heading, path: `/${category}/styles/${style.slug}` },
  ];

  return (
    <main className="pt-14 sm:pt-20">
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbs)} />
      <header className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-10">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-leather">
          {style.intro?.trim() ||
            `Explore ${heading.toLowerCase()} from the Kapriz collection.`}
        </p>
      </header>
      <CatalogExperience products={listing.items} />
      {style.editorialContent ? (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal">
            {heading}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-leather">
            {style.editorialContent}
          </p>
        </section>
      ) : null}
    </main>
  );
}
