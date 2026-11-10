import type { Metadata } from "next";
import { CartContent } from "@/components/commerce/cart-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Shopping Bag");

export default function CartPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-charcoal">Shopping Bag</h1>
      <div className="mt-12"><CartContent /></div>
    </main>
  );
}
