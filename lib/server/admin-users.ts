import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const userListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  createdAt: true,
  _count: {
    select: {
      orders: true,
      addresses: true,
      personalisationRequests: true,
    },
  },
} satisfies Prisma.UserSelect;

const userDetailInclude = {
  addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
  orders: {
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true, productName: true, quantity: true, totalPrice: true } } },
  },
  personalisationRequests: {
    orderBy: { createdAt: "desc" },
    include: { product: { select: { id: true, name: true, slug: true } } },
  },
} satisfies Prisma.UserInclude;

export async function listAdminUsers(query?: string) {
  const search = query?.trim();
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: userListSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          orders: true,
          addresses: true,
          personalisationRequests: true,
        },
      },
      ...userDetailInclude,
    },
  });
}
