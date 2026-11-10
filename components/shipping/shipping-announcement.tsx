import Link from "next/link";
import type { TranslateFn } from "@/lib/i18n/create-translator";

type ShippingAnnouncementProps = {
  t: TranslateFn;
};

export function ShippingAnnouncement({ t }: ShippingAnnouncementProps) {
  return (
    <div className="overflow-x-hidden bg-brown px-4 py-2 text-center text-xs text-ivory sm:text-sm">
      <span>{t("shipping.announcement")}</span>
      <Link
        href="/shipping"
        className="ml-3 inline-block border-b border-ivory/70 pb-px font-semibold text-white transition-colors hover:border-white"
      >
        {t("shipping.detailsLink")}
      </Link>
    </div>
  );
}
