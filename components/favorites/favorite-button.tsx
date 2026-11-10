"use client";

import { Icon } from "@/components/ui/icon";
import { useCommerce } from "@/context/commerce-context";

export function FavoriteButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { favoriteIds, toggleFavorite, user } = useCommerce();
  const isFavorite = favoriteIds.includes(productId);

  return (
    <button
      type="button"
      aria-label={`${isFavorite ? "Remove" : "Save"} ${productName} ${isFavorite ? "from" : "to"} favorites`}
      aria-pressed={isFavorite}
      onClick={() => {
        if (!user) {
          window.dispatchEvent(new Event("kapriz:open-auth"));
          return;
        }
        void toggleFavorite(productId);
      }}
      className={`absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-ivory/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown ${
        isFavorite ? "text-brown" : "text-charcoal"
      }`}
    >
      <Icon name="heart" className={isFavorite ? "size-5 fill-brown" : "size-5"} />
    </button>
  );
}
