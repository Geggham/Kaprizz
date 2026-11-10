import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminCategories } from "@/lib/server/admin-categories";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ categories: await listAdminCategories() });
  } catch (error) {
    return handleRouteError(error);
  }
}
