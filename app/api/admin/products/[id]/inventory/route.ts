import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { updateAdminProductInventory } from "@/lib/server/admin-products";
import { adminProductInventorySchema } from "@/lib/validation/admin-products";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const input = adminProductInventorySchema.parse(await request.json());
    return ok({ product: await updateAdminProductInventory(id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
