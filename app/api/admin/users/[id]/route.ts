import { UserRole } from "@/generated/prisma/client";
import { notFound } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { getAdminUser } from "@/lib/server/admin-users";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const user = await getAdminUser(id);
    if (!user) throw notFound("User not found");
    return ok({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
