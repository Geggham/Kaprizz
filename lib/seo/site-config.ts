import "server-only";

export const siteConfig = {
  name: "Kapriz",
  brand: "Kapriz",
  defaultDescription:
    "Men's and women's classic footwear by Kapriz. Timeless design and attention to detail.",
  logoPath: "/images/for-al-boxes.png",
} as const;

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be set to an absolute origin for production SEO URLs",
      );
    }

    return "http://localhost:3000";
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
    return url.origin;
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be a valid absolute URL such as https://example.com",
    );
  }
}

export function getSiteUrl(): string {
  return resolveSiteUrl();
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return `${base}/`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function absoluteAssetUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return absoluteUrl(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`);
}
