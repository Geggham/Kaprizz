"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCommerce } from "@/context/commerce-context";
import { OrderDetails, type OrderView } from "@/components/commerce/order-details";

type ApiEnvelope<T> = {
  data?: T | null;
};

export function AccountOrdersContent() {
  const { isReady, user } = useCommerce();
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    void fetch("/api/orders")
      .then(async (response) => {
        const payload = (await response.json()) as ApiEnvelope<{ orders?: OrderView[] }>;
        if (!response.ok) throw new Error();
        setOrders(payload.data?.orders ?? []);
      })
      .catch(() => setMessage("Orders are unavailable right now. Please try again."));
  }, [user]);

  if (!isReady) return <div className="h-40" />;
  if (!user) {
    return (
      <section className="border-t border-sand pt-6">
        <p className="text-leather">Sign in to view your orders.</p>
        <button type="button" onClick={() => window.dispatchEvent(new Event("kapriz:open-auth"))} className="mt-5 border-b border-brown pb-1 text-sm font-semibold text-brown">Sign In</button>
      </section>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-charcoal">My orders</h1>
      {message ? <p role="alert" className="mt-5 text-sm text-brown">{message}</p> : null}
      {orders.length ? (
        <div className="mt-8 space-y-10">
          {orders.map((order, index) => <OrderDetails key={order.id ?? order.orderNumber ?? index} order={order} />)}
        </div>
      ) : (
        <section className="mt-8 border-t border-sand pt-6">
          <p className="text-leather">You have no orders yet.</p>
          <Link href="/women" className="mt-5 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown">Continue shopping</Link>
        </section>
      )}
    </div>
  );
}
