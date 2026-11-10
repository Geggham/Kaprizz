"use client";

import Image from "next/image";
import Link from "next/link";
import { useCommerce } from "@/context/commerce-context";
import { formatProductPrice } from "@/lib/product-formatters";
import { useTranslate } from "@/hooks/use-translate";

export function CartContent() {
  const { cart, isReady, removeFromCart, updateQuantity, user } = useCommerce();
  const { locale } = useTranslate();
  const subtotal = cart.reduce(
    (total, item) => total + (item.unitPrice ?? 0) * item.quantity,
    0,
  );

  if (!isReady) return <div className="h-40" />;

  if (!cart.length) {
    return (
      <section className="bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-charcoal">Your bag is empty.</h2>
        <p className="mt-3 text-leather">
          Discover handcrafted shoes made to become part of your story.
        </p>
        <Link
          href="/men"
          className="mt-6 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          Explore Collections
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="divide-y divide-sand border-y border-sand">
        {cart.map((item) => (
          <article
            key={`${item.productId}-${item.colorId}-${item.size}`}
            className="flex gap-5 py-5"
          >
            <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-white sm:w-32">
              <Image
                src={item.image ?? "/images/for-al-boxes.png"}
                alt={item.productName ?? "Product"}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="font-semibold text-charcoal">
                {item.productName ?? "Product"}
              </h2>
              <p className="mt-2 text-sm text-leather">
                {item.colorName} · Size {item.size}
              </p>
              <p className="mt-3 text-sm text-brown">
                {formatProductPrice(item.unitPrice ?? 0, "USD", locale)}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(
                      item.productId,
                      item.colorId,
                      item.size,
                      item.quantity - 1,
                    )
                  }
                  className="border border-sand px-2 py-1"
                  aria-label={`Decrease quantity for ${item.productName}`}
                >
                  −
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    void updateQuantity(
                      item.productId,
                      item.colorId,
                      item.size,
                      item.quantity + 1,
                    )
                  }
                  className="border border-sand px-2 py-1"
                  aria-label={`Increase quantity for ${item.productName}`}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void removeFromCart(
                      item.productId,
                      item.colorId,
                      item.size,
                    )
                  }
                  className="ml-auto text-sm font-semibold text-brown underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
      <aside className="h-fit bg-white p-6">
        <h2 className="text-xl font-semibold text-charcoal">Order Summary</h2>
        {!user ? (
          <p className="mt-4 text-sm text-leather">
            Sign in to sync your bag and checkout with saved addresses.
          </p>
        ) : null}
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-leather">Subtotal</dt>
            <dd className="text-charcoal">
              {formatProductPrice(subtotal, "USD", locale)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-leather">Shipping</dt>
            <dd className="text-charcoal">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-4 font-semibold text-charcoal">
            <dt>Order Total</dt>
            <dd>{formatProductPrice(subtotal, "USD", locale)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-7 block bg-brown px-4 py-3 text-center text-sm font-semibold text-white"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
