import "server-only";

import type { PersonalisationType } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

export async function listPersonalisationRequests(userId: string) {
  return prisma.personalisationRequest.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPersonalisationRequest(
  userId: string,
  input: {
    productId: string;
    variantId?: string | null;
    type: PersonalisationType;
    value: string;
    notes?: string | null;
  },
) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, isActive: true },
    select: { id: true },
  });
  if (!product) throw notFound("Product not found");

  if (input.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: input.variantId,
        productId: input.productId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!variant) throw notFound("Variant not found");
  }

  return prisma.personalisationRequest.create({
    data: {
      userId,
      productId: input.productId,
      variantId: input.variantId ?? null,
      type: input.type,
      value: input.value.trim(),
      notes: input.notes?.trim() || null,
      status: "REQUESTED",
    },
  });
}
