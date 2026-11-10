import { UserRole } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { cmsSectionSchema } from "@/lib/validation/admin-cms";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    const data = cmsSectionSchema.parse(await request.json());
    const section = await prisma.cmsSection.update({
      where: { id },
      data: {
        key: data.key,
        page: data.page,
        imageUrl: data.imageUrl || null,
        position: data.position,
        isActive: data.isActive,
        translations: {
          upsert: data.translations.map(({ locale, ...translation }) => ({
            where: { sectionId_locale: { sectionId: id, locale } },
            update: translation,
            create: { locale, ...translation },
          })),
        },
      },
      include: { translations: true },
    });
    return ok({ section });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    const { id } = await context.params;
    await prisma.cmsSection.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
