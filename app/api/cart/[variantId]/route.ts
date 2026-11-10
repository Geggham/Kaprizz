import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import { removeCartItem, updateCartItemQuantity } from "@/lib/server/cart";
import { updateCartItemSchema } from "@/lib/validation/schemas";

type RouteContext = {
  params: Promise<{ variantId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { variantId } = await context.params;
    const body = updateCartItemSchema.parse(await request.json());
    const cart = await updateCartItemQuantity(user.id, variantId, body.quantity);
    return ok(cart);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { variantId } = await context.params;
    const cart = await removeCartItem(user.id, variantId);
    return ok(cart);
  } catch (error) {
    return handleRouteError(error);
  }
}
