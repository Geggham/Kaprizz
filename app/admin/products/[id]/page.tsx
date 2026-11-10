import { notFound } from "next/navigation";
import { ProductEditor, type ProductEditorValue } from "@/components/admin/product-editor";
import { getAdminProduct } from "@/lib/server/admin-products";
import { prisma } from "@/lib/prisma";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAdminProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    prisma.category.findMany({
      select: { id: true, name: true, model: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!product) notFound();

  const initialValue: ProductEditorValue = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    price: Number(product.price),
    gender: product.gender,
    model: product.model,
    categoryId: product.categoryId,
    isActive: product.isActive,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      position: image.position,
    })),
    colors: product.colors.map((color) => ({
      id: color.id,
      persistedId: color.id,
      name: color.name,
      hex: color.hex,
    })),
    sizes: product.sizes.map((size) => size.size),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      colorId: variant.colorId,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      isActive: variant.isActive,
      priceOverride: variant.priceOverride === null ? null : Number(variant.priceOverride),
    })),
  };

  return <ProductEditor initialValue={initialValue} categories={categories} />;
}
