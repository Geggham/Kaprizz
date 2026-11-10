export type ProductCategory = "men" | "women";

export type ShoeModel =
  | "Oxford"
  | "Derby"
  | "Loafer"
  | "Monk Strap"
  | "Boot"
  | "Mary Jane"
  | "Pump"
  | "Ballet Flat"
  | "Slingback";

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

export type ProductVariantOffer = {
  id: string;
  sku: string;
  size: number;
  stock: number;
  isActive: boolean;
  price: number;
  colorId: string;
  colorName: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  model: ShoeModel;
  price: number;
  currency: "USD";
  image: string;
  images: ProductImage[];
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  colors: ProductColor[];
  sizes: number[];
  unavailableSizes?: number[];
  variants: ProductVariantOffer[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
};
