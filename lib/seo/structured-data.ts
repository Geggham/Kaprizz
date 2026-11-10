import { absoluteAssetUrl, absoluteUrl, siteConfig } from "@/lib/seo/site-config";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type ProductOfferInput = {
  sku: string;
  price: number;
  currency: "USD";
  availability: "InStock" | "OutOfStock";
  url: string;
};

export type ProductStructuredDataInput = {
  name: string;
  description: string;
  images: string[];
  brand?: string;
  sku?: string;
  url: string;
  offers: ProductOfferInput[];
};

type JsonLdRecord = Record<string, unknown>;

export function getOrganizationJsonLd(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteAssetUrl(siteConfig.logoPath),
  };
}

export function getWebSiteJsonLd(): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
  };
}

export function getBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdRecord {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

function offerNode(offer: ProductOfferInput): JsonLdRecord {
  return {
    "@type": "Offer",
    url: offer.url,
    sku: offer.sku,
    priceCurrency: offer.currency,
    price: offer.price.toFixed(2),
    availability: `https://schema.org/${offer.availability}`,
    itemCondition: "https://schema.org/NewCondition",
  };
}

export function getProductJsonLd(product: ProductStructuredDataInput): JsonLdRecord {
  const images = product.images.map(absoluteAssetUrl);
  const prices = product.offers.map((offer) => offer.price);
  const uniquePrices = [...new Set(prices.map((price) => price.toFixed(2)))];
  const hasStock = product.offers.some((offer) => offer.availability === "InStock");

  let offers: JsonLdRecord;
  if (product.offers.length === 0) {
    offers = {
      "@type": "Offer",
      url: product.url,
      priceCurrency: "USD",
      price: "0.00",
      availability: "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    };
  } else if (uniquePrices.length === 1 && product.offers.length === 1) {
    offers = offerNode(product.offers[0]);
  } else if (uniquePrices.length === 1) {
    offers = {
      "@type": "AggregateOffer",
      url: product.url,
      priceCurrency: product.offers[0].currency,
      lowPrice: uniquePrices[0],
      highPrice: uniquePrices[0],
      offerCount: product.offers.length,
      availability: `https://schema.org/${hasStock ? "InStock" : "OutOfStock"}`,
      itemCondition: "https://schema.org/NewCondition",
      offers: product.offers.map(offerNode),
    };
  } else {
    const numericPrices = prices;
    offers = {
      "@type": "AggregateOffer",
      url: product.url,
      priceCurrency: product.offers[0].currency,
      lowPrice: Math.min(...numericPrices).toFixed(2),
      highPrice: Math.max(...numericPrices).toFixed(2),
      offerCount: product.offers.length,
      availability: `https://schema.org/${hasStock ? "InStock" : "OutOfStock"}`,
      itemCondition: "https://schema.org/NewCondition",
      offers: product.offers.map(offerNode),
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    sku: product.sku ?? product.offers[0]?.sku,
    brand: {
      "@type": "Brand",
      name: product.brand ?? siteConfig.brand,
    },
    url: product.url,
    offers,
  };
}
