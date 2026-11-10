import "server-only";

import type { PersonalisationStatus, Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

const customerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.UserSelect;

const requestInclude = {
  user: { select: customerSelect },
  product: { select: { id: true, name: true, slug: true } },
  variant: {
    select: {
      id: true,
      sku: true,
      size: true,
      color: { select: { name: true } },
    },
  },
};

export type AdminPersonalisationRequest = Prisma.PersonalisationRequestGetPayload<{
  include: typeof requestInclude;
}>;

export async function listAdminPersonalisationRequests() {
  return prisma.personalisationRequest.findMany({
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminPersonalisationRequest(
  id: string,
): Promise<AdminPersonalisationRequest | null> {
  return prisma.personalisationRequest.findUnique({ where: { id }, include: requestInclude });
}

export async function updateAdminPersonalisationStatus(
  id: string,
  status: PersonalisationStatus,
) {
  const request = await prisma.personalisationRequest.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!request) throw notFound("Personalisation request not found");

  return prisma.personalisationRequest.update({
    where: { id },
    data: { status },
    include: requestInclude,
  });
}
