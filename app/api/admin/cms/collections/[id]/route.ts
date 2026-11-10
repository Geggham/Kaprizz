import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { saveHomeCollection } from "@/lib/server/cms";
import { homeCollectionSchema } from "@/lib/validation/admin-cms";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    return ok({ collection: await saveHomeCollection(homeCollectionSchema.parse(await request.json()), id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    await prisma.homeCollection.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
