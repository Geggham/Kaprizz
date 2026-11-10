import { requireUser } from "@/lib/auth/guards";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { addCartItem, getCart } from "@/lib/server/cart";
import { addCartItemSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireUser();
    const cart = await getCart(user.id);
    return ok(cart);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = addCartItemSchema.parse(await request.json());
    const cart = await addCartItem(user.id, body);
    return created(cart);
  } catch (error) {
    return handleRouteError(error);
  }
}
