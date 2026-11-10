import "server-only";

import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import type { ShippingCountryInput } from "@/lib/validation/admin-shipping";

export async function listAdminShippingCountries() {
  return prisma.shippingCountry.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createAdminShippingCountry(data: ShippingCountryInput) {
  return prisma.shippingCountry.create({ data });
}

export async function updateAdminShippingCountry(id: string, data: ShippingCountryInput) {
  const country = await prisma.shippingCountry.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!country) throw notFound("Shipping country not found");

  return prisma.shippingCountry.update({
    where: { id },
    data,
  });
}

export async function deleteAdminShippingCountry(id: string) {
  const country = await prisma.shippingCountry.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!country) throw notFound("Shipping country not found");

  await prisma.shippingCountry.delete({ where: { id } });
}
