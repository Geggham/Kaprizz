import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/server/safe-query";

export type ShippingCountryView = {
  code: string;
  name: string;
  available: boolean;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  estimatedDelivery: string;
};

export type ShippingQuote = {
  available: true;
  countryCode: string;
  countryName: string;
  methodId: "standard";
  methodName: string;
  price: Prisma.Decimal;
  currency: "USD";
  estimatedMinDays: number;
  estimatedMaxDays: number;
};

function mapCountry(country: {
  code: string;
  name: string;
  isActive: boolean;
  estimatedMinDays: number;
  estimatedMaxDays: number;
}): ShippingCountryView {
  return {
    code: country.code,
    name: country.name,
    available: country.isActive,
    estimatedMinDays: country.estimatedMinDays,
    estimatedMaxDays: country.estimatedMaxDays,
    estimatedDelivery: `${country.estimatedMinDays}–${country.estimatedMaxDays} business days`,
  };
}

export async function getActiveShippingCountries() {
  return safeQuery([], async () => {
    const countries = await prisma.shippingCountry.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return countries.map(mapCountry);
  });
}

export async function getShippingCountryByCode(code: string) {
  const country = await prisma.shippingCountry.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!country || !country.isActive) {
    throw notFound("Shipping is not available for this country");
  }
  return mapCountry(country);
}

/**
 * Single source of truth for the current standard-delivery quote.
 * The Decimal price is intentionally kept server-side until presentation.
 */
export async function getShippingQuote(
  countryCode: string,
): Promise<ShippingQuote> {
  const country = await prisma.shippingCountry.findUnique({
    where: { code: countryCode.toUpperCase() },
  });
  if (!country || !country.isActive) {
    throw notFound("Delivery is currently unavailable to this country");
  }

  return {
    available: true,
    countryCode: country.code,
    countryName: country.name,
    methodId: "standard",
    methodName: "Standard delivery",
    price: country.shippingPrice,
    currency: "USD",
    estimatedMinDays: country.estimatedMinDays,
    estimatedMaxDays: country.estimatedMaxDays,
  };
}
