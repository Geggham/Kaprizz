import Link from "next/link";
import { listAdminProducts } from "@/lib/server/admin-products";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <main className="p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-leather">Catalog and inventory management.</p>
        </div>
        <Link href="/admin/products/new" className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white">
          New product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto border border-sand bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Variants</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Flags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-sand last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-leather">/{product.slug}</p>
                </td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                <td className="px-4 py-3">{product._count.variants}</td>
                <td className="px-4 py-3">{product.totalStock}</td>
                <td className="px-4 py-3">{product.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  {[
                    product.isNew && "New",
                    product.isFeatured && "Featured",
                    product.isBestSeller && "Best seller",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${product.id}`} className="font-semibold text-leather hover:text-brown">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-leather">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
