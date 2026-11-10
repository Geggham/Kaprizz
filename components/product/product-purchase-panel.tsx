"use client";

import { useRef, useState } from "react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { useCommerce } from "@/context/commerce-context";
import { formatProductPrice } from "@/lib/product-formatters";
import { useTranslate } from "@/hooks/use-translate";
import type { Product } from "@/types";

function DropdownChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 transition-transform group-open:rotate-180"
    >
      <path
        d="m5 7.5 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ProductPurchasePanel({
  product,
  shipping,
}: {
  product: Product;
  shipping: React.ReactNode;
}) {
  const { addToCart } = useCommerce();
  const { locale, t } = useTranslate();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id ?? "");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState("");
  const sizeDetailsRef = useRef<HTMLDetailsElement>(null);
  const color = product.colors.find((item) => item.id === selectedColor);

  const add = async () => {
    if (selectedSize === null) {
      setError(t("productPage.selectSizeError"));
      if (sizeDetailsRef.current) sizeDetailsRef.current.open = true;
      return;
    }
    try {
      setError("");
      await addToCart(product, selectedColor, selectedSize);
      window.dispatchEvent(new Event("kapriz:open-cart"));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not add to bag");
    }
  };

  return (
    <section className="md:sticky md:top-28">
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-sm text-leather">{product.model}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
            {product.name}
          </h1>
        </div>
        <FavoriteButton productId={product.id} productName={product.name} />
      </div>
      <p className="mt-6 max-w-xl leading-7 text-leather">{product.description}</p>
      <p className="mt-7 text-xl font-medium text-brown">
        {formatProductPrice(product.price, product.currency, locale)}
      </p>

      <div className="mt-9 border-t border-charcoal">
        <details className="group border-b border-charcoal">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-base font-medium text-charcoal [&::-webkit-details-marker]:hidden">
            <span>{t("productPage.color")}</span>
            <span className="flex items-center gap-3">
              {color ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-5 rounded-full border border-charcoal/20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                </>
              ) : null}
              <DropdownChevron />
            </span>
          </summary>
          <fieldset className="pb-6">
            <legend className="sr-only">{t("productPage.color")}</legend>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((item) => {
                const selected = item.id === selectedColor;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={t("productPage.selectColor", { color: item.name })}
                    aria-pressed={selected}
                    onClick={() => setSelectedColor(item.id)}
                    className={`flex items-center gap-2 border px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${selected ? "border-brown" : "border-sand hover:border-leather"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="size-5 rounded-full border border-charcoal/20"
                      style={{ backgroundColor: item.hex }}
                    />
                    {item.name}
                    <span className="sr-only">
                      {selected ? `, ${t("productPage.selected")}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </details>

        <details ref={sizeDetailsRef} className="group border-b border-charcoal">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-base font-medium text-charcoal [&::-webkit-details-marker]:hidden">
            <span>{t("productPage.sizeAndFit")}</span>
            <span className="flex items-center gap-3">
              {selectedSize !== null ? <span>{selectedSize}</span> : null}
              <DropdownChevron />
            </span>
          </summary>
          <fieldset className="pb-6">
            <legend className="sr-only">{t("productPage.sizeAndFit")}</legend>
            <p className="mb-4 text-xs text-leather underline underline-offset-4">
              {t("productPage.sizeGuide")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => {
                const selected = selectedSize === size;
                const unavailable =
                  product.unavailableSizes?.includes(size) ?? false;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={unavailable}
                    aria-pressed={selected}
                    aria-label={t(
                      unavailable
                        ? "productPage.sizeUnavailable"
                        : "productPage.selectSize",
                      { size },
                    )}
                    onClick={() => {
                      setSelectedSize(size);
                      setError("");
                    }}
                    className={`border px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-brown disabled:cursor-not-allowed disabled:border-sand disabled:bg-sand/50 disabled:text-leather disabled:line-through ${selected ? "border-brown bg-brown text-white" : "border-sand text-charcoal hover:border-leather"}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {error ? (
              <p className="mt-3 text-sm text-brown" role="alert">
                {error}
              </p>
            ) : null}
          </fieldset>
        </details>
      </div>

      <button type="button" onClick={() => void add()} className="mt-7 w-full bg-brown px-4 py-4 text-sm font-semibold text-white transition-colors hover:bg-leather focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown">
        {t("productPage.addToBag")}
      </button>
      {shipping}
      <details className="border-b border-sand py-5 text-sm text-charcoal">
        <summary className="cursor-pointer font-semibold">{t("productPage.productDetails")}</summary>
        <p className="mt-3 leading-6 text-leather">{t("productPage.productDetailsText")}</p>
      </details>
      <details className="border-b border-sand py-5 text-sm text-charcoal">
        <summary className="cursor-pointer font-semibold">{t("productPage.materialsCare")}</summary>
        <p className="mt-3 leading-6 text-leather">{t("productPage.materialsCareText")}</p>
      </details>
    </section>
  );
}
