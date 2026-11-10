import type { Metadata } from "next";
import { FavoritesContent } from "@/components/commerce/favorites-content";
import { buildNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildNoIndexMetadata("Favorites");

export default function FavoritesPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-charcoal">
          Favorites
        </h1>
        <p className="mt-4 text-leather">
          Saved pieces from the Kapriz collection.
        </p>
      </header>
      <div className="mt-12">
        <FavoritesContent />
      </div>
    </main>
  );
}
