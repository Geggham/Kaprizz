import { UserRole } from "@/generated/prisma/client";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { listAdminCmsSections } from "@/lib/server/cms";
import { cmsSectionSchema } from "@/lib/validation/admin-cms";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ sections: await listAdminCmsSections() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    const data = cmsSectionSchema.parse(await request.json());
    const section = await prisma.cmsSection.create({
      data: {
        key: data.key,
        page: data.page,
        imageUrl: data.imageUrl || null,
        position: data.position,
        isActive: data.isActive,
        translations: { create: data.translations.map(({ locale, ...translation }) => ({ locale, ...translation })) },
      },
      include: { translations: true },
    });
    return created({ section });
  } catch (error) {
    return handleRouteError(error);
  }
}
