import type {
  Product as DbProduct,
  ProductColor as DbColor,
  ProductImage as DbImage,
  ProductSize as DbSize,
  ProductVariant as DbVariant,
  ProductModel,
  Gender,
} from "@/generated/prisma/client";
import type { Product, ProductCategory, ShoeModel } from "@/types";

const modelLabels: Record<ProductModel, ShoeModel> = {
  OXFORD: "Oxford",
  DERBY: "Derby",
  LOAFER: "Loafer",
  MONK_STRAP: "Monk Strap",
  BOOT: "Boot",
  MARY_JANE: "Mary Jane",
  PUMP: "Pump",
  BALLET_FLAT: "Ballet Flat",
  SLINGBACK: "Slingback",
};

type ProductWithRelations = DbProduct & {
  images: DbImage[];
  colors: DbColor[];
  sizes: DbSize[];
  variants?: DbVariant[];
};

export function genderToCategory(gender: Gender): ProductCategory {
  return gender === "MEN" ? "men" : "women";
}

export function categoryToGender(category: ProductCategory): Gender {
  return category === "men" ? "MEN" : "WOMEN";
}

export function mapProductModel(model: ProductModel): ShoeModel {
  return modelLabels[model];
}

export function toNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : Number(value.toString());
}

export function mapDbProductToView(product: ProductWithRelations): Product {
  const images = [...product.images]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      id: image.id,
      src: image.url,
      alt: image.alt,
    }));

  const unavailableSizes = product.sizes
    .filter((size) => !size.available)
    .map((size) => size.size);

  const colorNameById = new Map(
    product.colors.map((color) => [color.id, color.name] as const),
  );
  const basePrice = toNumber(product.price);

  const variants = (product.variants ?? []).map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    stock: variant.stock,
    isActive: variant.isActive,
    price:
      variant.priceOverride != null ? toNumber(variant.priceOverride) : basePrice,
    colorId: variant.colorId,
    colorName: colorNameById.get(variant.colorId) ?? "Color",
  }));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: genderToCategory(product.gender),
    model: mapProductModel(product.model),
    price: basePrice,
    currency: "USD",
    image: images[0]?.src ?? "/images/for-al-boxes.png",
    images,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    colors: product.colors.map((color) => ({
      id: color.id,
      name: color.name,
      hex: color.hex,
    })),
    sizes: [...product.sizes]
      .sort((a, b) => a.size - b.size)
      .map((size) => size.size),
    unavailableSizes,
    variants,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    isFeatured: product.isFeatured,
  };
}
