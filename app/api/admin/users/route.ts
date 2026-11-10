import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminUsers } from "@/lib/server/admin-users";

export async function GET(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    const search = new URL(request.url).searchParams.get("search") ?? undefined;
    return ok({ users: await listAdminUsers(search) });
  } catch (error) {
    return handleRouteError(error);
  }
}
