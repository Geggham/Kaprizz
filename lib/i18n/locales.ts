import {
  defaultLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";

export type LocaleOption = {
  code: Locale;
  name: string;
  flag: string;
};

export const localeOptions: LocaleOption[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "hy", name: "Հայերեն", flag: "🇦🇲" },
];

export function getLocaleOption(locale: Locale): LocaleOption {
  return (
    localeOptions.find((option) => option.code === locale) ??
    localeOptions.find((option) => option.code === defaultLocale) ??
    localeOptions[0]
  );
}

export function parseLocale(value: string | undefined | null): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}
