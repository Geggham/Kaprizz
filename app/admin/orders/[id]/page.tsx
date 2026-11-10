import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusForm } from "@/components/admin/status-form";
import { getAdminOrder } from "@/lib/server/admin-orders";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <main className="p-5 sm:p-8">
      <Link href="/admin/orders" className="text-sm font-semibold text-leather hover:text-brown">
        ← Orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Order</h1>
          <p className="mt-2 font-mono text-sm text-leather">
            {order.orderNumber}
          </p>
        </div>
        <StatusForm
          action="Update order"
          endpoint={`/api/admin/orders/${order.id}`}
          initialStatus={order.status}
          options={orderStatuses}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-sand bg-white p-5">
          <h2 className="text-lg font-semibold">Customer</h2>
          <p className="mt-4 font-semibold">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p className="text-leather">{order.customerEmail}</p>
          <p className="mt-3 text-sm text-leather">Placed {order.createdAt.toLocaleDateString()}</p>
        </section>
        <section className="border border-sand bg-white p-5">
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <p className="mt-4 font-semibold">
            {order.shippingFirstName} {order.shippingLastName}
          </p>
          <p className="text-leather">
            {order.shippingAddressLine1}
            {order.shippingAddressLine2
              ? `, ${order.shippingAddressLine2}`
              : ""}
          </p>
          <p className="text-leather">
            {order.shippingCity}, {order.shippingPostalCode},{" "}
            {order.shippingCountryName}
          </p>
          <p className="mt-3 text-sm text-leather">{order.shippingPhone}</p>
        </section>
      </div>

      <section className="mt-6 overflow-x-auto border border-sand bg-white">
        <h2 className="border-b border-sand px-5 py-4 text-lg font-semibold">Items</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Color</th>
              <th className="px-5 py-3 font-semibold">Size</th>
              <th className="px-5 py-3 font-semibold">Quantity</th>
              <th className="px-5 py-3 font-semibold">Unit price</th>
              <th className="px-5 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-sand last:border-0">
                <td className="px-5 py-3 font-semibold">{item.productName}</td>
                <td className="px-5 py-3">{item.colorName}</td>
                <td className="px-5 py-3">{item.size}</td>
                <td className="px-5 py-3">{item.quantity}</td>
                <td className="px-5 py-3">${Number(item.unitPrice).toFixed(2)}</td>
                <td className="px-5 py-3">${Number(item.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 ml-auto w-full max-w-sm border border-sand bg-white p-5 text-sm">
        <dl className="space-y-3">
          <div className="flex justify-between gap-4"><dt className="text-leather">Subtotal</dt><dd>${Number(order.subtotal).toFixed(2)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-leather">Shipping</dt><dd>${Number(order.shippingCost).toFixed(2)}</dd></div>
          <div className="flex justify-between gap-4 border-t border-sand pt-3 text-base font-semibold"><dt>Total</dt><dd>${Number(order.total).toFixed(2)}</dd></div>
        </dl>
      </section>
    </main>
  );
}
