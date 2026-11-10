import { z } from "zod";

const countryCode = z
  .string()
  .trim()
  .length(2)
  .transform((value) => value.toUpperCase());

/** Debounce-friendly: ignore short keystrokes; cap length for abuse. */
export const addressAutocompleteQuerySchema = z.object({
  query: z.string().trim().min(3).max(120),
  countryCode,
});

export const addressValidateSchema = z.object({
  countryCode,
  administrativeArea: z.string().trim().max(120).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().max(32).optional().nullable(),
  addressLine1: z.string().trim().min(1).max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
});

export type AddressValidateInput = z.infer<typeof addressValidateSchema>;
