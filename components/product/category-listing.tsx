import Link from "next/link";
import { CatalogExperience } from "@/components/product/catalog-experience";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import type { TranslateFn } from "@/lib/i18n/create-translator";
import { categoryToGender } from "@/lib/mappers/product";
import { listCategoriesWithActiveProducts } from "@/lib/server/categories";
import { getProductsByCategory } from "@/lib/server/products";
import { getBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import type { ProductCategory } from "@/types";

type CategoryListingProps = {
  category: ProductCategory;
  t: TranslateFn;
};

export async function CategoryListing({ category, t }: CategoryListingProps) {
  const isMen = category === "men";
  const [products, styles] = await Promise.all([
    getProductsByCategory(category),
    listCategoriesWithActiveProducts(categoryToGender(category)),
  ]);

  const title = t(isMen ? "pages.menTitle" : "pages.womenTitle");
  const intro = t(isMen ? "pages.menText" : "pages.womenText");
  const editorial = t(isMen ? "pages.menEditorial" : "pages.womenEditorial");
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: title, path: `/${category}` },
  ];

  return (
    <main className="pt-14 sm:pt-20">
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbs)} />
      <header className="mx-auto max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-10">
        <Breadcrumbs items={breadcrumbs} />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-leather">
          Kapriz
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-leather">{intro}</p>
        {styles.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-leather">
              {t("pages.shopByStyle")}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {styles.map((style) => (
                <li key={style.id}>
                  <Link
                    href={`/${category}/styles/${style.slug}`}
                    className="inline-flex border border-sand bg-white px-3 py-2 text-sm font-medium text-charcoal transition-colors hover:border-brown hover:text-brown"
                  >
                    {style.seoHeading?.trim() || style.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>
      <CatalogExperience products={products} />
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10">
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-leather">
          {editorial}
        </p>
      </section>
    </main>
  );
}
