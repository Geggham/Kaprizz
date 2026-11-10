import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
});

export const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  country: z.string().trim().length(2),
  city: z.string().trim().min(1).max(120),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  postalCode: z.string().trim().min(1).max(32),
  phone: z.string().trim().min(5).max(40),
  isDefault: z.boolean().optional(),
});

export const favoriteSchema = z.object({
  productId: z.string().min(1),
});

export const addCartItemSchema = z.object({
  variantId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  colorId: z.string().min(1).optional(),
  size: z.number().int().positive().optional(),
  quantity: z.number().int().positive().max(20).default(1),
}).refine(
  (value) =>
    Boolean(value.variantId) ||
    (Boolean(value.productId) && Boolean(value.colorId) && Boolean(value.size)),
  { message: "Provide variantId or productId + colorId + size" },
);

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(20),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().min(1),
});

export const personalisationSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional().nullable(),
  type: z.enum(["INITIALS", "DATE", "CUSTOM_TEXT"]),
  value: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).optional().nullable(),
});

const booleanQuery = z
  .enum(["true", "false"])
  .optional()
  .transform((value) =>
    value === undefined ? undefined : value === "true",
  );

export const productQuerySchema = z.object({
  gender: z.enum(["MEN", "WOMEN", "men", "women"]).optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  size: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isNew: booleanQuery,
  isBestSeller: booleanQuery,
  isFeatured: booleanQuery,
  sort: z
    .enum(["featured", "newest", "priceAsc", "priceDesc"])
    .optional()
    .default("featured"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(60).optional().default(24),
});
