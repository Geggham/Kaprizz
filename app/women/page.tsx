import type { Metadata } from "next";
import { CategoryListing } from "@/components/product/category-listing";
import { getTranslator } from "@/lib/i18n/get-translator";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return buildPageMetadata({
    title: t("pages.womenTitle"),
    description: t("pages.womenText"),
    path: "/women",
  });
}

export default async function WomenPage() {
  const { t } = await getTranslator();

  return <CategoryListing category="women" t={t} />;
}
