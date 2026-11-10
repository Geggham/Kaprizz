import { z } from "zod";

export const adminCategorySeoSchema = z.object({
  seoHeading: z.string().trim().max(200).nullable(),
  intro: z.string().trim().max(1_000).nullable(),
  editorialContent: z.string().trim().max(10_000).nullable(),
  seoTitle: z.string().trim().max(60).nullable(),
  seoDescription: z.string().trim().max(160).nullable(),
});

export type AdminCategorySeoInput = z.infer<typeof adminCategorySeoSchema>;
