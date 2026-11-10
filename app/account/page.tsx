import type { Metadata } from "next";
import { AccountContent } from "@/components/commerce/account-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("My Account");

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16 sm:py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-charcoal">
        My Account
      </h1>
      <p className="mt-4 text-leather">Your Kapriz details and saved pieces.</p>
      <div className="mt-12">
        <AccountContent />
      </div>
    </main>
  );
}
