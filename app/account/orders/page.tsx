import type { Metadata } from "next";
import { AccountOrdersContent } from "@/components/commerce/account-orders-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("My Orders");

export default function AccountOrdersPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">
      <AccountOrdersContent />
    </main>
  );
}
