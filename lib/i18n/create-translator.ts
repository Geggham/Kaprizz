import type { Messages } from "@/locales/en";
import { en } from "@/locales/en";
import { hy } from "@/locales/hy";
import { ru } from "@/locales/ru";
import type { Locale } from "@/lib/i18n/config";

export const messageBundles: Record<Locale, Messages> = {
  en,
  ru,
  hy,
};

export type MessageKey = LeavePaths<Messages>;

type LeavePaths<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: LeavePaths<
        T[K],
        Prefix extends "" ? K : `${Prefix}.${K}`
      >;
    }[keyof T & string];

type Params = Record<string, string | number>;

function getByPath(messages: Messages, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);

  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, params?: Params): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

export type TranslateFn = (key: MessageKey, params?: Params) => string;

export function createTranslator(
  locale: Locale,
  messages: Messages = messageBundles[locale],
): TranslateFn {
  return (key, params) => {
    const fromLocale = getByPath(messages, key);
    const fallback = getByPath(en, key);
    const text = fromLocale ?? fallback ?? key;
    return interpolate(text, params);
  };
}

/** Swap this later for a backend bundle fetch. */
export function getMessageBundle(locale: Locale): Messages {
  return messageBundles[locale];
}
