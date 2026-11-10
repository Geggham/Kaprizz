import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { updateAdminCategorySeo } from "@/lib/server/admin-categories";
import { adminCategorySeoSchema } from "@/lib/validation/admin-categories";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const category = await updateAdminCategorySeo(
      id,
      adminCategorySeoSchema.parse(await request.json()),
    );
    return ok({ category });
  } catch (error) {
    return handleRouteError(error);
  }
}
