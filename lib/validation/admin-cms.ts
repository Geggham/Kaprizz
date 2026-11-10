import { z } from "zod";

const localeSchema = z.enum(["en", "ru", "hy"]);

/** Absolute http(s) URL or root-relative path beginning with `/`. */
export function isCmsImageUrl(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const cmsSectionSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[a-z0-9._-]+$/),
  page: z.enum(["home", "about"]),
  imageUrl: z
    .string()
    .trim()
    .refine(isCmsImageUrl, { message: "Must be an absolute URL or a root-relative path" })
    .optional(),
  position: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
  translations: z.array(z.object({
    locale: localeSchema,
    eyebrow: z.string().trim().max(200).optional().nullable(),
    title: z.string().trim().max(300).optional().nullable(),
    text: z.string().trim().max(10000).optional().nullable(),
    imageAlt: z.string().trim().max(500).optional().nullable(),
    ctaLabel: z.string().trim().max(200).optional().nullable(),
  })).length(3),
});

export type CmsSectionInput = z.infer<typeof cmsSectionSchema>;

const localizedTextSchema = z.object({
  locale: localeSchema,
  value: z.string().trim().min(1).max(10000),
}).array().length(3);

/** Optional localized strings (empty values allowed), e.g. navigation imageAlt. */
const optionalLocalizedTextSchema = z.object({
  locale: localeSchema,
  value: z.string().trim().max(10000),
}).array().length(3);

export const homeCollectionSchema = z.object({
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/),
  href: z.string().trim().min(1).max(500),
  image: z.string().trim().min(1).max(2000),
  position: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
  title: localizedTextSchema,
  description: localizedTextSchema,
  imageAlt: localizedTextSchema,
});

const navigationLinkSchema = z.object({
  id: z.string().optional(),
  href: z.string().trim().min(1).max(500),
  position: z.coerce.number().int().min(0).max(999),
  labels: localizedTextSchema,
});

const navigationGroupSchema = z.object({
  id: z.string().optional(),
  key: z.string().trim().min(1).max(100).regex(/^[a-z0-9._-]+$/),
  position: z.coerce.number().int().min(0).max(999),
  titles: localizedTextSchema,
  links: z.array(navigationLinkSchema).max(40),
});

export const navigationItemSchema = z.object({
  key: z.string().trim().min(1).max(100).regex(/^[a-z0-9._-]+$/),
  href: z.string().trim().min(1).max(500),
  image: z.string().trim().max(2000).optional().nullable(),
  position: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
  labels: localizedTextSchema,
  imageAlts: optionalLocalizedTextSchema,
  groups: z.array(navigationGroupSchema).max(20),
});

export type HomeCollectionInput = z.infer<typeof homeCollectionSchema>;
export type NavigationItemInput = z.infer<typeof navigationItemSchema>;
