import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import { removeFavorite } from "@/lib/server/favorites";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { productId } = await context.params;
    const productIds = await removeFavorite(user.id, productId);
    return ok({ productIds });
  } catch (error) {
    return handleRouteError(error);
  }
}
