export const locales = ["en", "ru", "hy"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeCookieName = "kapriz_locale";

export const localeToHtmlLang: Record<Locale, string> = {
  hy: "hy",
  ru: "ru",
  en: "en",
};

export const localeToBcp47: Record<Locale, string> = {
  hy: "hy-AM",
  ru: "ru-RU",
  en: "en-US",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
