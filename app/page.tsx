import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { Collections } from "@/components/home/collections";
import { FootstepTransition } from "@/components/home/footstep-transition";
import { Hero } from "@/components/home/hero";
import { getTranslator } from "@/lib/i18n/get-translator";
import { formatProductPrice } from "@/lib/product-formatters";
import { getHomeCollections } from "@/lib/server/collections";
import { getNavigation } from "@/lib/server/navigation";
import { getFeaturedProducts } from "@/lib/server/products";
import { getCmsSection } from "@/lib/server/cms";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();

  return buildPageMetadata({
    title: t("meta.homeTitle"),
    description: t("meta.homeDescription"),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const { locale, t } = await getTranslator();
  const [collections, featuredProducts, navigation, hero, aboutTeaser] = await Promise.all([
    getHomeCollections(locale),
    getFeaturedProducts(),
    getNavigation(locale),
    getCmsSection("home.hero", locale),
    getCmsSection("home.about-teaser", locale),
  ]);
  const menLabel =
    navigation.find((item) => item.href === "/men")?.label ?? "Men";
  const womenLabel =
    navigation.find((item) => item.href === "/women")?.label ?? "Women";

  return (
    <main>
      <FootstepTransition
        hero={<Hero t={t} menLabel={menLabel} womenLabel={womenLabel} content={hero} />}
        collections={<Collections t={t} collections={collections} />}
      />

      <section
        aria-labelledby="models-title"
        className="bg-sand px-4 py-16 sm:px-6 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <h2
            id="models-title"
            className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            {t("home.featuredTitle")}
          </h2>
          {featuredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
              {featuredProducts.map((product) => (
                <article key={product.id}>
                  <Link href={`/${product.category}/${product.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-white">
                      <Image
                        src={product.image}
                        alt={product.images[0]?.alt ?? product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 33vw, 50vw"
                      />
                    </div>
                    <p className="mt-4 text-xs text-leather">
                      {product.model}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-charcoal sm:text-base">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-charcoal">
                      {formatProductPrice(product.price, product.currency, locale)}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyNotice text={t("home.emptyFeatured")} />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {aboutTeaser?.eyebrow ?? t("home.aboutEyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          {aboutTeaser?.title ?? t("home.aboutTitle")}
        </h2>
        <p className="mt-5 leading-7 text-leather">
          {aboutTeaser?.text ?? t("home.aboutText")}
        </p>
        <Link
          href="/about"
          className="mt-7 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          {aboutTeaser?.ctaLabel ?? t("home.aboutCta")}
        </Link>
      </section>

      <section className="border-y border-sand bg-white px-6 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            {t("shipping.homeTitle")}
          </h2>
          <p className="mt-4 leading-7 text-leather">
            {t("shipping.homeText")}
          </p>
          <Link
            href="/shipping"
            className="mt-6 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown transition-colors hover:text-leather"
          >
            {t("shipping.homeCta")}
          </Link>
        </div>
      </section>
    </main>
  );
}
