import "server-only";

import {
  OrderStatus,
  PersonalisationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 5;

const ACTIVE_PERSONALISATION_STATUSES: PersonalisationStatus[] = [
  PersonalisationStatus.REQUESTED,
  PersonalisationStatus.APPROVED,
  PersonalisationStatus.IN_PROGRESS,
];

export type AdminDashboardMetrics = {
  pendingOrders: number;
  lowStockVariants: number;
  activePersonalisationQueue: number;
  users: number;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [pendingOrders, lowStockVariants, activePersonalisationQueue, users] =
    await Promise.all([
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.productVariant.count({
        where: {
          isActive: true,
          stock: { lte: LOW_STOCK_THRESHOLD },
        },
      }),
      prisma.personalisationRequest.count({
        where: { status: { in: ACTIVE_PERSONALISATION_STATUSES } },
      }),
      prisma.user.count(),
    ]);

  return {
    pendingOrders,
    lowStockVariants,
    activePersonalisationQueue,
    users,
  };
}
