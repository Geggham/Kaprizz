import { z } from "zod";

const text = (max: number) => z.string().trim().min(1).max(max);

export const checkoutContactSchema = z.object({
  firstName: text(80),
  lastName: text(80),
  email: z.string().trim().email().max(255),
  phone: text(40).min(5),
});

export const checkoutShippingAddressSchema = z.object({
  firstName: text(80),
  lastName: text(80),
  country: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  city: text(120),
  addressLine1: text(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  postalCode: text(32),
  phone: text(40).min(5),
});

export const checkoutCartItemSchema = z.object({
  variantId: z.string().trim().min(1).max(128),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutInputSchema = z.object({
  contact: checkoutContactSchema.optional(),
  shippingAddress: checkoutShippingAddressSchema,
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  deliveryMethod: z.literal("standard"),
  cartItems: z.array(checkoutCartItemSchema).min(1).max(50).optional(),
  saveAddress: z.boolean().optional().default(false),
  clientRequestId: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .refine(
      (value) => z.uuid().safeParse(value).success || /^[A-Za-z0-9_-]+$/.test(value),
      "Expected a UUID or safe idempotency token",
    ),
}).superRefine((value, context) => {
  if (value.shippingAddress.country !== value.countryCode) {
    context.addIssue({
      code: "custom",
      path: ["countryCode"],
      message: "countryCode must match shippingAddress.country",
    });
  }
});

export const checkoutSummaryQuerySchema = z.object({
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
});

export const checkoutPreviewSchema = z.object({
  preview: z.literal(true),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  cartItems: z.array(checkoutCartItemSchema).min(1).max(50),
});

export const guestOrderStatusSchema = z.object({
  orderNumber: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
