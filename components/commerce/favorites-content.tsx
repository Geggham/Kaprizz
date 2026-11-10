"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { useCommerce } from "@/context/commerce-context";
import { useTranslate } from "@/hooks/use-translate";
import type { Product } from "@/types";

export function FavoritesContent() {
  const { favoriteIds, isReady, user } = useCommerce();
  const { locale, t } = useTranslate();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }

    const controller = new AbortController();
    void fetch("/api/favorites?full=1", { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: { data?: { products?: Product[] } }) => {
        setFavoriteProducts(payload.data?.products ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFavoriteProducts([]);
      });

    return () => controller.abort();
  }, [favoriteIds, isReady, user]);

  const visibleProducts = user ? favoriteProducts : [];

  if (!isReady) {
    return <div className="h-40" />;
  }

  if (!user) {
    return (
      <section className="bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-charcoal">Sign in to view favorites</h2>
        <p className="mt-3 text-leather">
          Favorites are saved to your account after you sign in.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("kapriz:open-auth"))}
          className="mt-6 border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          Sign In
        </button>
      </section>
    );
  }

  if (!visibleProducts.length) {
    return (
      <section className="bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-charcoal">Your favorites are empty.</h2>
        <p className="mt-3 text-leather">Save the shoes you love and return to them anytime.</p>
        <div className="mt-6 flex justify-center gap-5">
          <Link href="/men" className="border-b border-brown pb-1 text-sm font-semibold text-brown">Explore Men&apos;s Shoes</Link>
          <Link href="/women" className="border-b border-brown pb-1 text-sm font-semibold text-brown">Explore Women&apos;s Shoes</Link>
        </div>
      </section>
    );
  }

  return (
    <ProductGrid
      bestSellerLabel={t("catalog.bestSeller")}
      locale={locale}
      newLabel={t("catalog.new")}
      products={visibleProducts}
    />
  );
}
