import { UserRole } from "@/generated/prisma/client";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminNavigationItems, saveNavigationItem } from "@/lib/server/cms";
import { navigationItemSchema } from "@/lib/validation/admin-cms";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ items: await listAdminNavigationItems() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    return created({ item: await saveNavigationItem(navigationItemSchema.parse(await request.json())) });
  } catch (error) {
    return handleRouteError(error);
  }
}
