import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusForm } from "@/components/admin/status-form";
import { getAdminPersonalisationRequest } from "@/lib/server/admin-personalisation";

const personalisationStatuses = [
  "REQUESTED",
  "APPROVED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
] as const;

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminPersonalisationRequestPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getAdminPersonalisationRequest(id);
  if (!request) notFound();

  return (
    <main className="p-5 sm:p-8">
      <Link href="/admin/personalisation" className="text-sm font-semibold text-leather hover:text-brown">
        ← Personalisation
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Personalisation request</h1>
          <p className="mt-2 font-mono text-sm text-leather">{request.id}</p>
        </div>
        <StatusForm
          action="Update request"
          endpoint={`/api/admin/personalisation/${request.id}`}
          initialStatus={request.status}
          options={personalisationStatuses}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-sand bg-white p-5">
          <h2 className="text-lg font-semibold">Customer</h2>
          <p className="mt-4 font-semibold">{request.user.firstName} {request.user.lastName}</p>
          <p className="text-leather">{request.user.email}</p>
          <p className="mt-3 text-sm text-leather">Requested {request.createdAt.toLocaleDateString()}</p>
        </section>
        <section className="border border-sand bg-white p-5">
          <h2 className="text-lg font-semibold">Product</h2>
          <p className="mt-4 font-semibold">{request.product.name}</p>
          <p className="text-sm text-leather">/{request.product.slug}</p>
          {request.variant ? (
            <p className="mt-3 text-sm text-leather">
              {request.variant.sku} · {request.variant.color.name} · Size {request.variant.size}
            </p>
          ) : (
            <p className="mt-3 text-sm text-leather">No variant selected.</p>
          )}
        </section>
        <section className="border border-sand bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Customisation</h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-leather">Type</dt>
              <dd className="mt-1 font-semibold">{request.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-leather">Value</dt>
              <dd className="mt-1 font-semibold">{request.value}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-leather">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap">{request.notes || "No notes provided."}</dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
