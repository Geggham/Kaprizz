import Link from "next/link";
import { listAdminPersonalisationRequests } from "@/lib/server/admin-personalisation";

export default async function AdminPersonalisationPage() {
  const requests = await listAdminPersonalisationRequests();

  return (
    <main className="p-5 sm:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Personalisation</h1>
        <p className="mt-2 text-leather">Review customisation requests and their production status.</p>
      </div>

      <div className="mt-8 overflow-x-auto border border-sand bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Product / variant</th>
              <th className="px-4 py-3 font-semibold">Request</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-sand last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{request.user.firstName} {request.user.lastName}</p>
                  <p className="text-xs text-leather">{request.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{request.product.name}</p>
                  <p className="text-xs text-leather">
                    {request.variant
                      ? `${request.variant.sku} · ${request.variant.color.name} · ${request.variant.size}`
                      : "No variant selected"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{request.type}</p>
                  <p className="max-w-48 truncate text-xs text-leather">{request.value}</p>
                </td>
                <td className="px-4 py-3">{request.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3">{request.status}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/personalisation/${request.id}`}
                    className="font-semibold text-leather hover:text-brown"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!requests.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-leather">
                  No personalisation requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
