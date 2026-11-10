import { ShippingManager } from "@/components/admin/shipping-manager";
import { listAdminShippingCountries } from "@/lib/server/admin-shipping";

export default async function AdminShippingPage() {
  const countries = await listAdminShippingCountries();

  return (
    <main className="p-5 sm:p-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Shipping</h1>
        <p className="mt-2 text-leather">Manage countries and delivery estimates shown at checkout.</p>
      </div>
      <ShippingManager countries={countries} />
    </main>
  );
}
