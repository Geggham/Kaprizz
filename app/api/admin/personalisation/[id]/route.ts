import { UserRole } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import {
  getAdminPersonalisationRequest,
  updateAdminPersonalisationStatus,
} from "@/lib/server/admin-personalisation";
import { personalisationStatusSchema } from "@/lib/validation/admin-status";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const personalisationRequest = await getAdminPersonalisationRequest(id);
    if (!personalisationRequest) throw notFound("Personalisation request not found");
    return ok({ request: personalisationRequest });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const { status } = personalisationStatusSchema.parse(await request.json());
    return ok({ request: await updateAdminPersonalisationStatus(id, status) });
  } catch (error) {
    return handleRouteError(error);
  }
}
