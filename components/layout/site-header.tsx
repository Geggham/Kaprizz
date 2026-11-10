import Link from "next/link";
import { HeaderControls } from "@/components/commerce/header-controls";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import type { Locale } from "@/lib/i18n/config";
import type { TranslateFn } from "@/lib/i18n/create-translator";
import { getNavigation } from "@/lib/server/navigation";

type SiteHeaderProps = {
  locale: Locale;
  t: TranslateFn;
};

export async function SiteHeader({ locale, t }: SiteHeaderProps) {
  const navigationItems = await getNavigation(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-white/95 text-charcoal backdrop-blur">
      <div className="relative mx-auto flex h-[72px] w-full min-w-0 max-w-[1440px] items-center gap-2 px-3 sm:gap-8 sm:px-6 lg:px-10">
        <MobileNavigation items={navigationItems} />

        <Link
          href="/"
          aria-label={t("brand.homeAria")}
          className="mr-auto min-w-0 truncate text-lg font-extrabold uppercase tracking-[0.14em] text-brown sm:text-xl sm:tracking-[0.18em] md:mr-2"
        >
          {t("brand.name")}
        </Link>

        <DesktopNavigation items={navigationItems} t={t} />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
          <LanguageSwitcher currentLocale={locale} />
          <HeaderControls />
        </div>
      </div>
    </header>
  );
}
