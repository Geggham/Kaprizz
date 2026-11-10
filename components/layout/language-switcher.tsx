"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localeOptions } from "@/lib/i18n/locales";
import { setLocaleAction } from "@/lib/i18n/set-locale";
import { useTranslate } from "@/hooks/use-translate";

type LanguageSwitcherProps = {
  currentLocale: Locale;
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const { t } = useTranslate();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current =
    localeOptions.find((option) => option.code === currentLocale) ??
    localeOptions[0];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectLocale = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      await setLocaleAction(locale);
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={t("language.label")}
        disabled={isPending}
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full px-1.5 py-1.5 text-sm text-charcoal transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown disabled:opacity-60 sm:px-2.5"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {current.flag}
        </span>
        <span className="hidden font-medium sm:inline">{current.name}</span>
      </button>

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language.label")}
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] border border-sand bg-white py-1 shadow-lg"
        >
          {localeOptions.map((option) => {
            const selected = option.code === currentLocale;

            return (
              <li key={option.code} role="option" aria-selected={selected}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => selectLocale(option.code)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-sand focus-visible:bg-sand focus-visible:outline-none ${
                    selected ? "bg-ivory font-semibold text-brown" : "text-charcoal"
                  }`}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {option.flag}
                  </span>
                  <span>{option.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
