import Link from "next/link";
import type { TranslateFn } from "@/lib/i18n/create-translator";

type ProductShippingInfoProps = {
  t: TranslateFn;
};

export function ProductShippingInfo({ t }: ProductShippingInfoProps) {
  return (
    <aside className="mt-8 border-y border-sand py-5">
      <p className="text-sm font-semibold text-charcoal">
        {t("shipping.productAvailability")}
      </p>
      <Link
        href="/shipping"
        className="mt-2 inline-block text-sm text-leather underline underline-offset-4 transition-colors hover:text-brown"
      >
        {t("shipping.checkCountry")}
      </Link>
    </aside>
  );
}
