import type { Metadata } from "next";
import { CheckoutContent } from "@/components/commerce/checkout-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Checkout");

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-charcoal">
        Checkout
      </h1>
      <p className="mt-3 max-w-2xl text-leather">
        Review your bag and confirm delivery details to place your order.
      </p>
      <div className="mt-12">
        <CheckoutContent />
      </div>
    </main>
  );
}
