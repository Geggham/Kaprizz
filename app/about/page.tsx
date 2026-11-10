import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutSectionVideo } from "@/components/about/about-section-video";
import { getTranslator } from "@/lib/i18n/get-translator";
import { getCmsSection } from "@/lib/server/cms";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();

  return buildPageMetadata({
    title: t("meta.aboutTitle"),
    description: t("meta.aboutDescription"),
    path: "/about",
    absoluteTitle: true,
  });
}

export default async function AboutPage() {
  const { locale, t } = await getTranslator();
  const [hero, ...principleContent] = await Promise.all([
    getCmsSection("about.hero", locale),
    getCmsSection("about.principle.craft", locale),
    getCmsSection("about.principle.materials", locale),
    getCmsSection("about.principle.design", locale),
    getCmsSection("about.principle.character", locale),
  ]);

  const principles = [
    {
      number: "01",
      title: principleContent[0]?.title ?? t("about.craftTitle"),
      text: principleContent[0]?.text ?? t("about.craftText"),
    },
    {
      number: "02",
      title: principleContent[1]?.title ?? t("about.materialsPrincipleTitle"),
      text: principleContent[1]?.text ?? t("about.materialsPrincipleText"),
    },
    {
      number: "03",
      title: principleContent[2]?.title ?? t("about.designTitle"),
      text: principleContent[2]?.text ?? t("about.designText"),
    },
    {
      number: "04",
      title: principleContent[3]?.title ?? t("about.characterTitle"),
      text: principleContent[3]?.text ?? t("about.characterText"),
    },
  ] as const;

  return (
    <main>
      <section className="about-reveal relative flex min-h-[68svh] items-end overflow-hidden bg-brown sm:min-h-[78svh]">
        <Image
          src={hero?.imageUrl ?? "/images/banner-image.png"}
          alt={hero?.imageAlt ?? t("about.heroImageAlt")}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown/80 via-brown/35 to-brown/10" />
        <div className="relative mx-auto w-full max-w-[1100px] px-6 pb-16 pt-28 sm:pb-20 sm:pt-36 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            {hero?.eyebrow ?? t("about.heroEyebrow")}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {hero?.title ?? t("about.heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            {hero?.text ?? t("about.heroText")}
          </p>
        </div>
      </section>

      <section className="about-reveal mx-auto max-w-[820px] px-6 py-20 sm:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          {t("about.storyTitle")}
        </h2>
        <div className="mt-8 space-y-6 text-base leading-8 text-charcoal/90 sm:text-lg sm:leading-9">
          <p>{t("about.storyP1")}</p>
          <p>{t("about.storyP2")}</p>
          <p>{t("about.storyP3")}</p>
          <p>{t("about.storyP4")}</p>
        </div>
      </section>

      <section className="about-reveal border-y border-sand bg-white">
        <div className="mx-auto grid max-w-[1200px] md:grid-cols-2">
          <AboutSectionVideo className="relative min-h-[360px] md:min-h-[560px]" />
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              {t("about.handmadeTitle")}
            </h2>
            <p className="mt-4 text-lg text-leather">
              {t("about.handmadeSubtitle")}
            </p>
            <div className="mt-8 space-y-5 text-base leading-8 text-charcoal/90">
              <p>{t("about.handmadeP1")}</p>
              <p>{t("about.handmadeP2")}</p>
              <p>{t("about.handmadeP3")}</p>
              <p>{t("about.handmadeP4")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-reveal border-b border-sand bg-white">
        <div className="mx-auto grid max-w-[1200px] md:grid-cols-2">
          <div className="order-2 flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-20 lg:px-16 md:order-1">
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
              {t("about.materialsTitle")}
            </h2>
            <p className="mt-4 text-lg text-leather">
              {t("about.materialsSubtitle")}
            </p>
            <div className="mt-8 space-y-5 text-base leading-8 text-charcoal/90">
              <p>{t("about.materialsP1")}</p>
              <p>{t("about.materialsP2")}</p>
              <p>{t("about.materialsP3")}</p>
              <p>{t("about.materialsP4")}</p>
            </div>
          </div>
          <div className="relative order-1 min-h-[360px] md:order-2 md:min-h-[560px]">
            <Image
              src="/images/banner-image.png"
              alt={t("about.materialsImageAlt")}
              fill
              className="object-cover object-[center_65%]"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="about-reveal bg-ivory px-6 py-24 text-center sm:py-32">
        <p className="text-[clamp(4.5rem,14vw,9rem)] font-semibold leading-none tracking-tight text-brown">
          {t("about.sinceYear")}
        </p>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
          {t("about.sinceTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-leather sm:text-lg">
          {t("about.sinceText")}
        </p>
      </section>

      <section className="about-reveal mx-auto max-w-[820px] px-6 py-20 sm:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          {t("about.philosophyTitle")}
        </h2>
        <div className="mt-8 space-y-6 text-base leading-8 text-charcoal/90 sm:text-lg sm:leading-9">
          <p>{t("about.philosophyP1")}</p>
          <p>{t("about.philosophyP2")}</p>
          <p>{t("about.philosophyP3")}</p>
          <p>{t("about.philosophyP4")}</p>
        </div>
      </section>

      <section
        aria-labelledby="about-details-title"
        className="about-reveal border-y border-sand bg-white px-6 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1100px]">
          <h2
            id="about-details-title"
            className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl"
          >
            {t("about.detailsTitle")}
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:gap-x-16 lg:gap-y-14">
            {principles.map((principle) => (
              <article
                key={principle.number}
                className="border-t border-sand pt-6"
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-gold">
                  {principle.number}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-charcoal">
                  {principle.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-leather">
                  {principle.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-reveal mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-20 sm:py-28 md:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image
            src="/images/personalisation-box.png"
            alt={t("about.personalImageAlt")}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
            {t("about.personalTitle")}
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-charcoal/90">
            <p>{t("about.personalP1")}</p>
            <p>{t("about.personalP2")}</p>
          </div>
          <Link
            href="/personalisation"
            className="mt-8 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown transition-colors hover:text-leather"
          >
            {t("about.personalCta")}
          </Link>
        </div>
      </section>

      <section className="about-reveal bg-brown px-6 py-24 text-center text-white sm:py-32">
        <p className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {t("about.closingLineOne")}
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {t("about.closingLineTwo")}
        </p>
        <Link
          href="/men"
          className="mt-10 inline-block border border-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-brown"
        >
          {t("about.collectionsCta")}
        </Link>
      </section>
    </main>
  );
}
