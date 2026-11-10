"use client";

import { useState } from "react";
import { OrderDetails, type OrderView } from "@/components/commerce/order-details";

type ApiEnvelope<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type StatusResponse = {
  order?: OrderView;
} & OrderView;

export function OrderStatusContent() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderView | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const lookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setOrder(null);
    setPending(true);
    try {
      const response = await fetch("/api/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const payload = (await response.json()) as ApiEnvelope<StatusResponse>;
      if (!response.ok || !payload.data) {
        setMessage(payload.error?.message ?? "We could not find an order with those details.");
        return;
      }
      setOrder(payload.data.order ?? payload.data);
    } catch {
      setMessage("We could not look up your order. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={lookup} className="border-t border-sand pt-6">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Order status</h1>
        <p className="mt-3 text-leather">Enter the order number and email used at checkout.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-charcoal">Order number<input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} className="border border-sand px-3 py-3" /></label>
          <label className="grid gap-2 text-sm text-charcoal">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border border-sand px-3 py-3" /></label>
        </div>
        {message ? <p role="alert" className="mt-4 text-sm text-brown">{message}</p> : null}
        <button type="submit" disabled={pending} className="mt-6 bg-brown px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Checking..." : "Check status"}</button>
      </form>
      {order ? <div className="mt-10"><OrderDetails order={order} /></div> : null}
    </div>
  );
}
