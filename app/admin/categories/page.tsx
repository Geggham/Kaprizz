import { CategorySeoManager } from "@/components/admin/category-seo-manager";
import { listAdminCategories } from "@/lib/server/admin-categories";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <main className="p-5 sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Category SEO</h1>
      <p className="mt-2 text-leather">
        Manage search metadata and customer-facing category copy.
      </p>
      <CategorySeoManager categories={categories} />
    </main>
  );
}
