"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useTranslate } from "@/hooks/use-translate";
import type { NavigationItemView } from "@/types/navigation";

type MobileNavigationProps = {
  items: NavigationItemView[];
};

export function MobileNavigation({ items }: MobileNavigationProps) {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        aria-label={t("nav.openMenu")}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center p-2 text-charcoal"
      >
        <Icon name="menu" className="size-6" />
      </button>

      {isOpen ? (
        <>
          <div
            role="presentation"
            className="fixed inset-0 top-[72px] z-40 bg-charcoal/40"
          />
          <nav
            id={menuId}
            aria-label={t("nav.mobileAria")}
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-72px)] overflow-y-auto border-t border-sand bg-white px-6 py-6 shadow-lg"
          >
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  {item.groups ? (
                    <details>
                      <summary className="cursor-pointer list-none border-b border-sand py-4 text-base font-semibold text-charcoal">
                        {item.label}
                      </summary>
                      <div className="grid grid-cols-2 gap-6 py-5">
                        {item.groups.map((group) => (
                          <section key={group.id}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-leather">
                              {group.title}
                            </p>
                            <ul className="space-y-3">
                              {group.links.map((link) => (
                                <li key={link.href}>
                                  <Link
                                    className="text-sm text-charcoal hover:text-leather"
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      className="block border-b border-sand py-4 text-base font-semibold text-charcoal"
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}
