import { UserRole } from "@/generated/prisma/client";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminHomeCollections, saveHomeCollection } from "@/lib/server/cms";
import { homeCollectionSchema } from "@/lib/validation/admin-cms";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ collections: await listAdminHomeCollections() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    return created({ collection: await saveHomeCollection(homeCollectionSchema.parse(await request.json())) });
  } catch (error) {
    return handleRouteError(error);
  }
}
