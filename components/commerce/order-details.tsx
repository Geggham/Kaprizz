"use client";

import { formatProductPrice } from "@/lib/product-formatters";
import { useTranslate } from "@/hooks/use-translate";

export type OrderItemView = {
  id?: string;
  productName?: string;
  name?: string;
  colorName?: string;
  size?: string | number;
  quantity?: number;
  totalPrice?: string | number;
  unitPrice?: string | number;
};

export type OrderView = {
  id?: string;
  orderNumber?: string;
  number?: string;
  status?: string;
  email?: string;
  emailDelivered?: boolean;
  subtotal?: string | number;
  shippingCost?: string | number;
  total?: string | number;
  currency?: "USD";
  estimatedDelivery?: string;
  estimatedMinDays?: number;
  estimatedMaxDays?: number;
  shippingAddress?: {
    city?: string;
    country?: string;
  };
  city?: string;
  country?: string;
  items?: OrderItemView[];
};

function amount(value: string | number | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function deliveryEstimate(order: OrderView) {
  if (order.estimatedDelivery) return order.estimatedDelivery;
  if (order.estimatedMinDays && order.estimatedMaxDays) {
    return `${order.estimatedMinDays}–${order.estimatedMaxDays} business days`;
  }
  return "";
}

export function OrderDetails({
  order,
  showEmail = false,
}: {
  order: OrderView;
  showEmail?: boolean;
}) {
  const { locale } = useTranslate();
  const subtotal = amount(order.subtotal);
  const shippingCost = amount(order.shippingCost);
  const total = amount(order.total);
  const location = [order.shippingAddress?.city ?? order.city, order.shippingAddress?.country ?? order.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="border-t border-sand pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold text-charcoal">Order details</h2>
        {order.status ? <p className="text-sm font-semibold text-brown">{order.status}</p> : null}
      </div>
      {showEmail && order.email ? (
        <p className="mt-4 text-sm text-leather">
          {order.emailDelivered
            ? `A confirmation has been sent to ${order.email}.`
            : `Your order is recorded for ${order.email}.`}
        </p>
      ) : null}
      {location || deliveryEstimate(order) ? (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {location ? <div><dt className="text-leather">Delivery to</dt><dd className="mt-1 text-charcoal">{location}</dd></div> : null}
          {deliveryEstimate(order) ? <div><dt className="text-leather">Estimated delivery</dt><dd className="mt-1 text-charcoal">{deliveryEstimate(order)}</dd></div> : null}
        </dl>
      ) : null}
      {order.items?.length ? (
        <ul className="mt-6 divide-y divide-sand border-y border-sand">
          {order.items.map((item, index) => {
            const itemTotal = amount(item.totalPrice) ?? (amount(item.unitPrice) ?? 0) * (item.quantity ?? 1);
            return (
              <li key={item.id ?? `${item.productName ?? item.name ?? "item"}-${index}`} className="flex justify-between gap-4 py-4 text-sm">
                <span className="min-w-0 text-charcoal">
                  {item.productName ?? item.name ?? "Item"} × {item.quantity ?? 1}
                  {item.colorName || item.size ? <span className="block text-leather">{[item.colorName, item.size].filter(Boolean).join(" · ")}</span> : null}
                </span>
                <span className="shrink-0 text-charcoal">{formatProductPrice(itemTotal, "USD", locale)}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
      {subtotal !== undefined || shippingCost !== undefined || total !== undefined ? (
        <dl className="ml-auto mt-6 max-w-xs space-y-3 text-sm">
          {subtotal !== undefined ? <div className="flex justify-between gap-6"><dt className="text-leather">Subtotal</dt><dd>{formatProductPrice(subtotal, "USD", locale)}</dd></div> : null}
          {shippingCost !== undefined ? <div className="flex justify-between gap-6"><dt className="text-leather">Delivery</dt><dd>{formatProductPrice(shippingCost, "USD", locale)}</dd></div> : null}
          {total !== undefined ? <div className="flex justify-between gap-6 border-t border-sand pt-3 text-base font-semibold text-charcoal"><dt>Total</dt><dd>{formatProductPrice(total, "USD", locale)}</dd></div> : null}
        </dl>
      ) : null}
    </section>
  );
}
