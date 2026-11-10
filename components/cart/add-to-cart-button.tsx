"use client";

import { useState } from "react";
import { useCommerce } from "@/context/commerce-context";
import type { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCommerce();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addToCart(product, product.colors[0]?.id ?? "", product.sizes[0] ?? 0);
        setAdded(true);
      }}
      className="mt-6 w-full bg-brown px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-leather focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
    >
      {added ? "Added to Bag" : "Add to Bag"}
    </button>
  );
}
