import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import {
  deleteAdminShippingCountry,
  updateAdminShippingCountry,
} from "@/lib/server/admin-shipping";
import { shippingCountrySchema } from "@/lib/validation/admin-shipping";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const country = await updateAdminShippingCountry(
      id,
      shippingCountrySchema.parse(await request.json()),
    );
    return ok({ country });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    await deleteAdminShippingCountry(id);
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
