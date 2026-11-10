import { getAdminDashboardMetrics } from "@/lib/server/admin-dashboard";

const metricLabels = [
  { key: "pendingOrders", label: "Pending orders" },
  { key: "lowStockVariants", label: "Low stock variants" },
  { key: "activePersonalisationQueue", label: "Personalisation queue" },
  { key: "users", label: "Users" },
] as const;

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <main className="p-5 sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-leather">
        A quick overview of your Kapriz store.
      </p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricLabels.map(({ key, label }) => (
          <div key={key} className="border border-sand bg-white p-5">
            <dt className="text-sm text-leather">{label}</dt>
            <dd className="mt-2 text-3xl font-semibold">{metrics[key]}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
