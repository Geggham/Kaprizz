import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/server/admin-users";

type PageProps = { params: Promise<{ id: string }> };

function formatMoney(value: { toString(): string }, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value));
}

export default async function AdminUserPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getAdminUser(id);
  if (!user) notFound();

  return (
    <main className="p-5 sm:p-8">
      <Link href="/admin/users" className="text-sm font-semibold text-leather hover:text-brown">← Users</Link>
      <div className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{user.firstName} {user.lastName}</h1>
        <p className="mt-2 text-leather">{user.email}</p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-sand bg-white p-4"><p className="text-sm text-leather">Role</p><p className="mt-1 font-semibold">{user.role}</p></div>
        <div className="border border-sand bg-white p-4"><p className="text-sm text-leather">Joined</p><p className="mt-1 font-semibold">{user.createdAt.toLocaleDateString()}</p></div>
        <div className="border border-sand bg-white p-4"><p className="text-sm text-leather">Orders</p><p className="mt-1 font-semibold">{user._count.orders}</p></div>
        <div className="border border-sand bg-white p-4"><p className="text-sm text-leather">Personalisation</p><p className="mt-1 font-semibold">{user._count.personalisationRequests}</p></div>
      </section>

      <section className="mt-6 border border-sand bg-white">
        <h2 className="border-b border-sand px-5 py-4 text-lg font-semibold">Addresses</h2>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {user.addresses.map((address) => (
            <article key={address.id} className="border border-sand p-4 text-sm">
              <div className="flex justify-between gap-4"><p className="font-semibold">{address.firstName} {address.lastName}</p>{address.isDefault && <span className="text-xs text-leather">Default</span>}</div>
              <p className="mt-2">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}</p>
              <p>{address.city}, {address.postalCode}, {address.country}</p>
              <p className="mt-2 text-leather">{address.phone}</p>
            </article>
          ))}
          {!user.addresses.length && <p className="text-sm text-leather">No saved addresses.</p>}
        </div>
      </section>

      <section className="mt-6 overflow-x-auto border border-sand bg-white">
        <h2 className="border-b border-sand px-5 py-4 text-lg font-semibold">Order history</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th></tr></thead>
          <tbody>
            {user.orders.map((order) => (
              <tr key={order.id} className="border-b border-sand last:border-0">
                <td className="px-5 py-3">{order.createdAt.toLocaleDateString()}</td>
                <td className="px-5 py-3">{order.status}</td>
                <td className="px-5 py-3">{order.items.map((item) => `${item.productName} ×${item.quantity}`).join(", ")}</td>
                <td className="px-5 py-3">{formatMoney(order.total, order.currency)}</td>
              </tr>
            ))}
            {!user.orders.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-leather">No orders yet.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="mt-6 overflow-x-auto border border-sand bg-white">
        <h2 className="border-b border-sand px-5 py-4 text-lg font-semibold">Personalisation history</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Request</th><th className="px-5 py-3">Status</th></tr></thead>
          <tbody>
            {user.personalisationRequests.map((request) => (
              <tr key={request.id} className="border-b border-sand last:border-0">
                <td className="px-5 py-3">{request.createdAt.toLocaleDateString()}</td>
                <td className="px-5 py-3">{request.product.name}</td>
                <td className="px-5 py-3">{request.type}: {request.value}</td>
                <td className="px-5 py-3">{request.status}</td>
              </tr>
            ))}
            {!user.personalisationRequests.length && <tr><td colSpan={4} className="px-5 py-8 text-center text-leather">No personalisation requests yet.</td></tr>}
          </tbody>
        </table>
      </section>
    </main>
  );
}
