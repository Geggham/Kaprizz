import { cookies } from "next/headers";
import { localeCookieName, type Locale } from "@/lib/i18n/config";
import {
  createTranslator,
  getMessageBundle,
  type TranslateFn,
} from "@/lib/i18n/create-translator";
import { parseLocale } from "@/lib/i18n/locales";
import type { Messages } from "@/locales/en";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(localeCookieName)?.value);
}

export async function getTranslator(): Promise<{
  locale: Locale;
  messages: Messages;
  t: TranslateFn;
}> {
  const locale = await getLocale();
  const messages = getMessageBundle(locale);
  return {
    locale,
    messages,
    t: createTranslator(locale, messages),
  };
}
