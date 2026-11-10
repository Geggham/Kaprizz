import type { Metadata } from "next";
import { OrderConfirmationContent } from "@/components/commerce/order-confirmation-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Order Confirmation");

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">
      <OrderConfirmationContent orderNumber={orderNumber} />
    </main>
  );
}
