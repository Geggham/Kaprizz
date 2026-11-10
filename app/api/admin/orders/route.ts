import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminOrders } from "@/lib/server/admin-orders";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ orders: await listAdminOrders() });
  } catch (error) {
    return handleRouteError(error);
  }
}
