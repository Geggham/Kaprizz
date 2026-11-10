import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ProductColorSwatches } from "@/components/product/product-color-swatches";
import { formatProductPrice } from "@/lib/product-formatters";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/types";

type ProductCardProps = {
  bestSellerLabel: string;
  locale: Locale;
  newLabel: string;
  product: Product;
};

export function ProductCard({
  bestSellerLabel,
  locale,
  newLabel,
  product,
}: ProductCardProps) {
  const href = `/${product.category}/${product.slug}`;

  return (
    <article className="relative">
      <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brown">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <Image
            src={product.image}
            alt={product.images[0]?.alt ?? product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
          {product.isNew || product.isBestSeller ? (
            <span className="absolute left-3 top-3 bg-ivory px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brown">
              {product.isNew ? newLabel : bestSellerLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-4 text-sm font-semibold text-charcoal sm:text-base">
          {product.name}
        </p>
      </Link>
      <FavoriteButton productId={product.id} productName={product.name} />
      <ProductColorSwatches
        colors={product.colors}
        productName={product.name}
      />
      <p className="mt-3 text-sm text-brown">
        {formatProductPrice(product.price, product.currency, locale)}
      </p>
    </article>
  );
}
