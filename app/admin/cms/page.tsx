import { CmsAdmin } from "@/components/admin/cms-admin";
import {
  listAdminCmsSections,
  listAdminHomeCollections,
  listAdminNavigationItems,
} from "@/lib/server/cms";

export default async function AdminCmsPage() {
  const [cmsSections, collections, navigation] = await Promise.all([
    listAdminCmsSections(),
    listAdminHomeCollections(),
    listAdminNavigationItems(),
  ]);

  return (
    <main className="p-5 sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight">CMS</h1>
      <p className="mt-2 text-leather">
        Manage Home, About, collections and navigation content in all locales.
      </p>
      <div className="mt-8">
        <CmsAdmin
          sections={cmsSections}
          collections={collections}
          navigation={navigation}
        />
      </div>
    </main>
  );
}
