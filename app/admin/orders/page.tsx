import Link from "next/link";
import { listAdminOrders } from "@/lib/server/admin-orders";

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <main className="p-5 sm:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-leather">Review orders and update their fulfilment status.</p>
      </div>

      <div className="mt-8 overflow-x-auto border border-sand bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-sand last:border-0">
                <td className="px-4 py-3 font-mono text-xs">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">
                    {order.customerFirstName} {order.customerLastName}
                  </p>
                  <p className="text-xs text-leather">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3">{order.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">{order.status}</td>
                <td className="px-4 py-3">${Number(order.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-leather hover:text-brown">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-leather">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
