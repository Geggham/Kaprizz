import Link from "next/link";
import type { TranslateFn } from "@/lib/i18n/create-translator";

type SiteFooterProps = {
  t: TranslateFn;
};

const footerLinks = [
  { href: "/men", labelKey: "footer.men" },
  { href: "/women", labelKey: "footer.women" },
  { href: "/about", labelKey: "footer.about" },
  { href: "/personalisation", labelKey: "footer.personalisation" },
  { href: "/shipping", labelKey: "footer.shipping" },
] as const;

export function SiteFooter({ t }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-sand bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-10">
        <div>
          <p className="text-lg font-extrabold uppercase tracking-[0.14em] text-brown">
            {t("brand.name")}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-leather">
            {t("footer.tagline")}
          </p>
        </div>
        <nav aria-label={t("footer.navAria")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-charcoal transition-colors hover:text-brown"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
