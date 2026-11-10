import type { Metadata } from "next";
import { OrderStatusContent } from "@/components/commerce/order-status-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Order Status");

export default function OrderStatusPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">
      <OrderStatusContent />
    </main>
  );
}
