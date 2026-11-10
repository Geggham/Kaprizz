import { UserRole } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { getAdminOrder, updateAdminOrderStatus } from "@/lib/server/admin-orders";
import { orderStatusSchema } from "@/lib/validation/admin-status";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const order = await getAdminOrder(id);
    if (!order) throw notFound("Order not found");
    return ok({ order });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const { status } = orderStatusSchema.parse(await request.json());
    return ok({ order: await updateAdminOrderStatus(id, status) });
  } catch (error) {
    return handleRouteError(error);
  }
}
