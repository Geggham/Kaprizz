import type { Metadata } from "next";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { CountrySelector } from "@/components/shipping/country-selector";
import { getTranslator } from "@/lib/i18n/get-translator";
import { getActiveShippingCountries } from "@/lib/server/shipping";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();

  return buildPageMetadata({
    title: t("shipping.pageTitle"),
    description: t("meta.shippingDescription"),
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const { t } = await getTranslator();
  const shippingCountries = await getActiveShippingCountries();
  const infoSections = [
    {
      title: t("shipping.deliveryTimesTitle"),
      text: t("shipping.deliveryTimesText"),
    },
    {
      title: t("shipping.costsTitle"),
      text: t("shipping.costsText"),
    },
    {
      title: t("shipping.customsTitle"),
      text: t("shipping.customsText"),
    },
    {
      title: t("shipping.processingTitle"),
      text: t("shipping.processingText"),
    },
  ] as const;

  return (
    <main>
      <header className="border-b border-sand bg-white px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-[860px] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Kapriz
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
            {t("shipping.pageTitle")}
          </h1>
          <p className="mt-5 text-lg text-leather">
            {t("shipping.pageSubtitle")}
          </p>
          <div className="mx-auto mt-8 max-w-2xl space-y-4 text-base leading-8 text-charcoal/90">
            <p>{t("shipping.intro")}</p>
            <p>{t("shipping.introNote")}</p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="delivery-countries-title"
        className="mx-auto grid max-w-[1100px] gap-10 px-6 py-16 sm:py-24 md:grid-cols-[1fr_360px]"
      >
        <div>
          <h2
            id="delivery-countries-title"
            className="text-3xl font-semibold tracking-tight text-charcoal"
          >
            {t("shipping.whereTitle")}
          </h2>
          {shippingCountries.length > 0 ? (
            <ul className="mt-8 grid grid-cols-2 border-t border-sand sm:grid-cols-3">
              {shippingCountries.map((country) => (
                <li
                  key={country.code}
                  className="border-b border-sand py-4 text-sm text-charcoal"
                >
                  {country.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <EmptyNotice text={t("shipping.emptyCountries")} />
            </div>
          )}
        </div>
        {shippingCountries.length > 0 ? (
          <CountrySelector
            countries={shippingCountries}
            labels={{
              available: t("shipping.available"),
              deliveryTo: t("shipping.deliveryTo"),
              estimatedDelivery: t("shipping.estimatedDelivery"),
              selectCountry: t("shipping.selectCountry"),
            }}
          />
        ) : null}
      </section>

      <section className="border-y border-sand bg-white px-6 py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1100px] gap-x-16 gap-y-10 sm:grid-cols-2">
          {infoSections.map((section) => (
            <article key={section.title} className="border-t border-sand pt-6">
              <h2 className="text-xl font-semibold text-charcoal">
                {section.title}
              </h2>
              <p className="mt-4 leading-7 text-leather">{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-6 py-20 text-center sm:py-28">
        <h2 className="text-3xl font-semibold tracking-tight text-charcoal">
          {t("shipping.helpTitle")}
        </h2>
        <p className="mt-5 leading-7 text-leather">{t("shipping.helpText")}</p>
      </section>
    </main>
  );
}
