import type { Metadata } from "next";
import Image from "next/image";
import { PersonalisationRequestForm } from "@/components/personalisation/personalisation-request-form";
import { getTranslator } from "@/lib/i18n/get-translator";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();

  return buildPageMetadata({
    title: t("meta.personalisationTitle"),
    description: t("meta.personalisationDescription"),
    path: "/personalisation",
  });
}

export default async function PersonalisationPage() {
  const { t } = await getTranslator();

  return (
    <main>
      <section className="relative min-h-[52svh] overflow-hidden bg-brown sm:min-h-[62svh]">
        <Image
          src="/images/banner-image.png"
          alt={t("personalisation.heroImageAlt")}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown/45 via-transparent to-brown/15" />
      </section>

      <section className="mx-auto max-w-[860px] px-6 py-16 sm:py-24 lg:py-28">
        <h1 className="text-center text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
          {t("personalisation.title")}
        </h1>
        <h2 className="mt-5 text-center text-lg font-medium tracking-wide text-leather sm:text-xl">
          {t("personalisation.subtitle")}
        </h2>
        <div className="mt-10 space-y-6 text-base leading-8 text-charcoal/90 sm:mt-12 sm:text-lg sm:leading-9">
          <p>{t("personalisation.paragraphOne")}</p>
          <p>{t("personalisation.paragraphTwo")}</p>
        </div>
        <PersonalisationRequestForm />
      </section>
    </main>
  );
}
