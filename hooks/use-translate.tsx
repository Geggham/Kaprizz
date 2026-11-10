"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";
import {
  createTranslator,
  type TranslateFn,
} from "@/lib/i18n/create-translator";
import type { Messages } from "@/locales/en";

type TranslateContextValue = {
  locale: Locale;
  messages: Messages;
  t: TranslateFn;
};

const TranslateContext = createContext<TranslateContextValue | null>(null);

type LocaleProviderProps = {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
};

export function LocaleProvider({
  locale,
  messages,
  children,
}: LocaleProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      messages,
      t: createTranslator(locale, messages),
    }),
    [locale, messages],
  );

  return (
    <TranslateContext.Provider value={value}>
      {children}
    </TranslateContext.Provider>
  );
}

export function useTranslate(): TranslateContextValue {
  const context = useContext(TranslateContext);

  if (!context) {
    throw new Error("useTranslate must be used within LocaleProvider");
  }

  return context;
}
