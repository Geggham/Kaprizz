"use client";

import { useEffect, useState } from "react";
import { useCommerce } from "@/context/commerce-context";
import type { Product } from "@/types";

type RequestItem = {
  id: string;
  type: string;
  value: string;
  status: string;
  product: { name: string };
};

export function PersonalisationRequestForm() {
  const { user } = useCommerce();
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"INITIALS" | "DATE" | "CUSTOM_TEXT">(
    "INITIALS",
  );
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/products?limit=60")
      .then((response) => response.json())
      .then((payload: { data?: { items?: Product[] } }) => {
        const items = payload.data?.items ?? [];
        setProducts(items);
        setProductId(items[0]?.id ?? "");
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/personalisation")
      .then((response) => response.json())
      .then((payload: { data?: { requests?: RequestItem[] } }) => {
        setRequests(payload.data?.requests ?? []);
      });
  }, [user]);

  if (!user) {
    return (
      <section className="border-t border-sand pt-10">
        <p className="text-leather">
          Sign in to submit a personalisation request.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("kapriz:open-auth"))}
          className="mt-4 border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          Sign In
        </button>
      </section>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/personalisation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        type,
        value,
        notes: notes || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error?.message ?? "Could not submit request");
      return;
    }
    setRequests((current) => [
      {
        id: payload.data.request.id,
        type: payload.data.request.type,
        value: payload.data.request.value,
        status: payload.data.request.status,
        product: {
          name:
            products.find((product) => product.id === productId)?.name ??
            "Product",
        },
      },
      ...current,
    ]);
    setValue("");
    setNotes("");
    setMessage("Request submitted.");
  };

  return (
    <section className="border-t border-sand pt-10">
      <h3 className="text-2xl font-semibold text-charcoal">Request personalisation</h3>
      <form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-4">
        <label className="text-sm text-charcoal">
          Product
          <select
            className="mt-2 w-full border border-sand px-3 py-3"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            required
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-charcoal">
          Type
          <select
            className="mt-2 w-full border border-sand px-3 py-3"
            value={type}
            onChange={(event) =>
              setType(event.target.value as "INITIALS" | "DATE" | "CUSTOM_TEXT")
            }
          >
            <option value="INITIALS">Initials</option>
            <option value="DATE">Date</option>
            <option value="CUSTOM_TEXT">Custom text</option>
          </select>
        </label>
        <label className="text-sm text-charcoal">
          Value
          <input
            className="mt-2 w-full border border-sand px-3 py-3"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
            maxLength={120}
          />
        </label>
        <label className="text-sm text-charcoal">
          Notes
          <textarea
            className="mt-2 w-full border border-sand px-3 py-3"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            maxLength={500}
          />
        </label>
        <button
          type="submit"
          className="bg-brown px-4 py-3 text-sm font-semibold text-white"
        >
          Submit request
        </button>
        {message ? <p className="text-sm text-leather">{message}</p> : null}
      </form>

      {requests.length ? (
        <div className="mt-10">
          <h4 className="text-lg font-semibold text-charcoal">Your requests</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {requests.map((request) => (
              <li key={request.id} className="border border-sand p-4">
                <p className="font-semibold text-charcoal">
                  {request.product.name} · {request.type}
                </p>
                <p className="mt-1 text-leather">
                  {request.value} · {request.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
