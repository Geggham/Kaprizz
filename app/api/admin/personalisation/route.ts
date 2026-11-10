import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminPersonalisationRequests } from "@/lib/server/admin-personalisation";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ requests: await listAdminPersonalisationRequests() });
  } catch (error) {
    return handleRouteError(error);
  }
}
