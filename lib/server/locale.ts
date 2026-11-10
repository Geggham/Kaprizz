import { defaultLocale, type Locale } from "@/lib/i18n/config";

export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: Locale,
): T | undefined {
  return (
    translations.find((row) => row.locale === locale) ??
    translations.find((row) => row.locale === defaultLocale) ??
    translations[0]
  );
}
