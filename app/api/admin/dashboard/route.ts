import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/lib/server/admin-dashboard";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ metrics: await getAdminDashboardMetrics() });
  } catch (error) {
    return handleRouteError(error);
  }
}
