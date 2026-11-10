"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderDetails, type OrderView } from "@/components/commerce/order-details";

type ApiEnvelope<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type ConfirmationResponse = {
  order?: OrderView;
} & OrderView;

export function OrderConfirmationContent({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [state, setState] = useState<"loading" | "unavailable" | "ready">("loading");

  useEffect(() => {
    void fetch(`/api/order-confirmation/${encodeURIComponent(orderNumber)}`)
      .then(async (response) => {
        const payload = (await response.json()) as ApiEnvelope<ConfirmationResponse>;
        if (!response.ok || !payload.data) throw new Error();
        setOrder(payload.data.order ?? payload.data);
        setState("ready");
      })
      .catch(() => setState("unavailable"));
  }, [orderNumber]);

  if (state === "loading") return <div className="h-48" aria-label="Loading order confirmation" />;

  if (state === "unavailable" || !order) {
    return (
      <section className="max-w-xl border-t border-sand pt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Order received</h1>
        <p className="mt-4 text-leather">
          We could not display order details in this browser. Use your confirmation email or order status to look it up securely.
        </p>
        <Link href="/order-status" className="mt-6 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown">Check order status</Link>
      </section>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brown">Thank you</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">Your order is confirmed</h1>
      <p className="mt-4 text-leather">Order {order.orderNumber ?? order.number ?? orderNumber}</p>
      <OrderDetails order={order} showEmail />
      <Link href="/order-status" className="mt-8 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown">Check order status</Link>
    </div>
  );
}
