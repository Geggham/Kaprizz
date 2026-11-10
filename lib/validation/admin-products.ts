import { z } from "zod";

const productModelSchema = z.enum([
  "OXFORD",
  "DERBY",
  "LOAFER",
  "MONK_STRAP",
  "BOOT",
  "MARY_JANE",
  "PUMP",
  "BALLET_FLAT",
  "SLINGBACK",
]);

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2_000)
  .refine(
    (value) => {
      if (value.startsWith("/")) {
        return (
          !value.startsWith("//") &&
          !value.startsWith("/\\") &&
          !/[\\\u0000-\u001F\u007F\s]/.test(value)
        );
      }

      try {
        const url = new URL(value);
        return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password;
      } catch {
        return false;
      }
    },
    "Use an absolute HTTP(S) URL or a root-relative path",
  );

const imageSchema = z.object({
  id: z.string().min(1).optional(),
  url: imageUrlSchema,
  alt: z.string().trim().min(1).max(255),
  position: z.number().int().min(0).max(100),
});

const colorSchema = z.object({
  id: z.string().min(1),
  persistedId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(80),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color"),
});

const variantSchema = z.object({
  id: z.string().min(1).optional(),
  colorId: z.string().min(1),
  size: z.number().int().min(1).max(100),
  sku: z.string().trim().min(1).max(120),
  stock: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
  priceOverride: z.number().nonnegative().max(1_000_000).nullable(),
});

const inventoryVariantSchema = z.object({
  id: z.string().min(1),
  stock: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});

export const adminProductInventorySchema = z
  .object({
    variants: z.array(inventoryVariantSchema).min(1).max(900),
  })
  .superRefine((value, context) => {
    const ids = new Set<string>();
    value.variants.forEach((variant, index) => {
      if (ids.has(variant.id)) {
        context.addIssue({
          code: "custom",
          path: ["variants", index, "id"],
          message: "Each variant may be updated once",
        });
      }
      ids.add(variant.id);
    });
  });

export const adminProductSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
    description: z.string().trim().min(1).max(10_000),
    seoTitle: z.string().trim().max(60).nullable().optional(),
    seoDescription: z.string().trim().max(160).nullable().optional(),
    price: z.number().nonnegative().max(1_000_000),
    gender: z.enum(["MEN", "WOMEN"]),
    model: productModelSchema,
    categoryId: z.string().min(1),
    isActive: z.boolean(),
    isNew: z.boolean(),
    isBestSeller: z.boolean(),
    isFeatured: z.boolean(),
    images: z.array(imageSchema).max(20),
    colors: z.array(colorSchema).min(1).max(30),
    sizes: z.array(z.number().int().min(1).max(100)).min(1).max(30),
    variants: z.array(variantSchema).min(1).max(900),
  })
  .superRefine((value, context) => {
    const colorIds = new Set(value.colors.map((color) => color.id));
    const colorNames = new Set<string>();
    const sizes = new Set<number>();
    const combinations = new Set<string>();
    const skus = new Set<string>();

    value.colors.forEach((color, index) => {
      const name = color.name.toLowerCase();
      if (colorNames.has(name)) {
        context.addIssue({ code: "custom", path: ["colors", index, "name"], message: "Color names must be unique" });
      }
      colorNames.add(name);
    });

    value.sizes.forEach((size, index) => {
      if (sizes.has(size)) {
        context.addIssue({ code: "custom", path: ["sizes", index], message: "Sizes must be unique" });
      }
      sizes.add(size);
    });

    value.variants.forEach((variant, index) => {
      if (!colorIds.has(variant.colorId) || !sizes.has(variant.size)) {
        context.addIssue({ code: "custom", path: ["variants", index], message: "Variant must reference a configured color and size" });
      }
      const combination = `${variant.colorId}:${variant.size}`;
      if (combinations.has(combination)) {
        context.addIssue({ code: "custom", path: ["variants", index], message: "Each color and size combination is allowed once" });
      }
      combinations.add(combination);
      if (skus.has(variant.sku.toLowerCase())) {
        context.addIssue({ code: "custom", path: ["variants", index, "sku"], message: "SKUs must be unique" });
      }
      skus.add(variant.sku.toLowerCase());
    });

    if (value.variants.length !== value.colors.length * value.sizes.length) {
      context.addIssue({ code: "custom", path: ["variants"], message: "Provide inventory for every color and size combination" });
    }
  });

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminProductInventoryInput = z.infer<typeof adminProductInventorySchema>;
