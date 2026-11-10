import { ProductCard } from "@/components/product/product-card";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types";

type ProductGridProps = {
  bestSellerLabel: string;
  locale: Locale;
  newLabel: string;
  products: Product[];
};

export function ProductGrid({
  bestSellerLabel,
  locale,
  newLabel,
  products,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          bestSellerLabel={bestSellerLabel}
          locale={locale}
          newLabel={newLabel}
          product={product}
        />
      ))}
    </div>
  );
}
