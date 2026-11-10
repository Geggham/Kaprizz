import { ProductModel } from "@/generated/prisma/client";
import { ProductEditor, type ProductEditorValue } from "@/components/admin/product-editor";
import { prisma } from "@/lib/prisma";

export default async function NewAdminProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, model: true },
    orderBy: { name: "asc" },
  });
  const defaultCategory = categories[0];

  const initialValue: ProductEditorValue = {
    name: "",
    slug: "",
    description: "",
    seoTitle: null,
    seoDescription: null,
    price: 0,
    gender: "MEN",
    model: defaultCategory?.model ?? ProductModel.OXFORD,
    categoryId: defaultCategory?.id ?? "",
    isActive: true,
    isNew: false,
    isBestSeller: false,
    isFeatured: false,
    images: [],
    colors: [{ id: "new-color-default", name: "Black", hex: "#000000" }],
    sizes: [39],
    variants: [{
      colorId: "new-color-default",
      size: 39,
      sku: "",
      stock: 0,
      isActive: true,
      priceOverride: null,
    }],
  };

  return <ProductEditor initialValue={initialValue} categories={categories} />;
}
