import "server-only";

import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

const customerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.UserSelect;

const orderInclude = {
  user: { select: customerSelect },
  shippingAddress: true,
  items: { orderBy: { createdAt: "asc" as const } },
};

export type AdminOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export async function listAdminOrders() {
  return prisma.order.findMany({
    include: { user: { select: customerSelect } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}

export async function updateAdminOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
  if (!order) throw notFound("Order not found");

  return prisma.order.update({
    where: { id },
    data: { status },
    include: orderInclude,
  });
}
