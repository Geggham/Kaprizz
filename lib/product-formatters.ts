import type { Locale } from "@/lib/i18n/config";
import { localeToBcp47 } from "@/lib/i18n/config";

export function formatProductPrice(
  price: number,
  currency: "USD",
  locale: Locale,
): string {
  return new Intl.NumberFormat(localeToBcp47[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
