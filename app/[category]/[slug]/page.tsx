import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductShippingInfo } from "@/components/shipping/product-shipping-info";
import { getTranslator } from "@/lib/i18n/get-translator";
import {
  getProductBySlug,
  getRecommendedProducts,
} from "@/lib/server/products";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getProductMetadata } from "@/lib/seo/metadata";
import {
  getBreadcrumbJsonLd,
  getProductJsonLd,
} from "@/lib/seo/structured-data";
import type { ProductCategory } from "@/types";

type ProductPageProps = {
  params: Promise<{ category: string; slug: string }>;
};

async function resolveProduct(category: string, slug: string) {
  if (category !== "men" && category !== "women") {
    return null;
  }

  const product = await getProductBySlug(slug);
  if (!product || product.category !== (category as ProductCategory)) {
    return null;
  }

  return product;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await resolveProduct(category, slug);

  if (!product) {
    return {};
  }

  return getProductMetadata({
    name: product.name,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    image: product.image,
    category: product.category,
    slug: product.slug,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  const product = await resolveProduct(category, slug);
  const { locale, t } = await getTranslator();

  if (!product) {
    notFound();
  }

  const recommendations = await getRecommendedProducts(product);
  const productUrl = absoluteUrl(`/${product.category}/${product.slug}`);
  const categoryLabel = t(
    product.category === "men" ? "pages.menTitle" : "pages.womenTitle",
  );
  const breadcrumbs = [
    { name: t("breadcrumbs.home"), path: "/" },
    { name: categoryLabel, path: `/${product.category}` },
    {
      name: product.name,
      path: `/${product.category}/${product.slug}`,
    },
  ];

  const sellableVariants = product.variants.filter((variant) => variant.isActive);
  const offers = sellableVariants.map((variant) => ({
    sku: variant.sku,
    price: variant.price,
    currency: product.currency,
    availability:
      variant.stock > 0
        ? ("InStock" as const)
        : ("OutOfStock" as const),
    url: productUrl,
  }));

  return (
    <main>
      <JsonLd
        data={[
          getBreadcrumbJsonLd(breadcrumbs),
          getProductJsonLd({
            name: product.name,
            description: product.description,
            images: product.images.map((image) => image.src),
            sku: sellableVariants[0]?.sku,
            url: productUrl,
            offers,
          }),
        ]}
      />
      <div className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      <section className="mx-auto grid max-w-[1400px] gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-16 lg:py-20">
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>
        <ProductPurchasePanel
          product={product}
          shipping={<ProductShippingInfo t={t} />}
        />
      </section>
      <section className="border-t border-sand px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-[1400px]">
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
            {t("productPage.youMayAlsoLike")}
          </h2>
          <div className="mt-10">
            <ProductGrid
              bestSellerLabel={t("catalog.bestSeller")}
              locale={locale}
              newLabel={t("catalog.new")}
              products={recommendations}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
