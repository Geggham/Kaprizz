import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StorefrontChrome } from "@/components/layout/storefront-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { ShippingAnnouncement } from "@/components/shipping/shipping-announcement";
import { CommerceProvider } from "@/context/commerce-context";
import { LocaleProvider } from "@/hooks/use-translate";
import { localeToHtmlLang } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/get-translator";
import { getSiteUrl, siteConfig } from "@/lib/seo/site-config";
import {
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from "@/lib/seo/structured-data";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-open-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("meta.siteTitleDefault"),
      template: t("meta.siteTitleTemplate"),
    },
    description: t("meta.siteDescription"),
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: t("meta.siteTitleDefault"),
      description: t("meta.siteDescription"),
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.siteTitleDefault"),
      description: t("meta.siteDescription"),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages, t } = await getTranslator();

  return (
    <html
      lang={localeToHtmlLang[locale]}
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <LocaleProvider locale={locale} messages={messages}>
          <CommerceProvider>
            <JsonLd data={[getOrganizationJsonLd(), getWebSiteJsonLd()]} />
            <StorefrontChrome
              announcement={<ShippingAnnouncement t={t} />}
              header={<SiteHeader locale={locale} t={t} />}
              footer={<SiteFooter t={t} />}
            >
              {children}
            </StorefrontChrome>
          </CommerceProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
