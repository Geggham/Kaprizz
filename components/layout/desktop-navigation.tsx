import Image from "next/image";
import Link from "next/link";
import type { TranslateFn } from "@/lib/i18n/create-translator";
import type { NavigationItemView } from "@/types/navigation";

type DesktopNavigationProps = {
  items: NavigationItemView[];
  t: TranslateFn;
};

function MegaMenu({
  item,
  t,
}: {
  item: NavigationItemView;
  t: TranslateFn;
}) {
  if (!item.groups) {
    return null;
  }

  return (
    <div className="invisible fixed inset-x-0 top-[72px] z-50 border-b border-sand bg-white opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_1fr_minmax(200px,280px)] gap-10 px-4 py-10 sm:px-6 lg:gap-16 lg:px-10">
        {item.groups.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`${item.id}-${group.id}`}
          >
            <p
              id={`${item.id}-${group.id}`}
              className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-leather"
            >
              {group.title}
            </p>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-sm text-charcoal transition-colors hover:text-leather"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {item.image && item.imageAlt ? (
          <Link className="group/image" href={item.href}>
            <div className="relative aspect-[4/3] overflow-hidden bg-sand">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                sizes="(min-width: 1024px) 280px, 240px"
              />
            </div>
            <span className="mt-3 block text-sm font-semibold text-brown">
              {t("nav.viewCollection")}
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function DesktopNavigation({ items, t }: DesktopNavigationProps) {
  return (
    <nav aria-label={t("nav.mainAria")} className="hidden md:block">
      <ul className="flex items-center gap-8">
        {items.map((item) => (
          <li className="group py-7" key={item.id}>
            <Link
              className="text-sm font-medium text-charcoal transition-colors hover:text-leather"
              href={item.href}
            >
              {item.label}
            </Link>
            <MegaMenu item={item} t={t} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
