import { UserRole } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import {
  deleteAdminProduct,
  getAdminProduct,
  updateAdminProduct,
} from "@/lib/server/admin-products";
import { adminProductSchema } from "@/lib/validation/admin-products";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const product = await getAdminProduct(id);
    if (!product) {
      throw notFound("Product not found");
    }
    return ok({ product });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const input = adminProductSchema.parse(await request.json());
    return ok({ product: await updateAdminProduct(id, input) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    return ok(await deleteAdminProduct(id));
  } catch (error) {
    return handleRouteError(error);
  }
}
