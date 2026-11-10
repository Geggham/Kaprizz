import { z } from "zod";

const shippingCountryFields = z.object({
  code: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{2,3}$/, "Use a 2–3 letter country code")),
  name: z.string().trim().min(1).max(100),
  isActive: z.boolean(),
  estimatedMinDays: z.coerce.number().int().min(0).max(365),
  estimatedMaxDays: z.coerce.number().int().min(0).max(365),
});

export const shippingCountrySchema = shippingCountryFields.refine(
  (data) => data.estimatedMinDays <= data.estimatedMaxDays,
  {
    message: "Minimum delivery days cannot exceed maximum delivery days",
    path: ["estimatedMaxDays"],
  },
);

export type ShippingCountryInput = z.infer<typeof shippingCountrySchema>;
