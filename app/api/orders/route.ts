import { requireUser } from "@/lib/auth/guards";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { createOrderFromCart, listOrdersForUser } from "@/lib/server/orders";
import { createOrderSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await listOrdersForUser(user.id);
    return ok({ orders });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createOrderSchema.parse(await request.json());
    const order = await createOrderFromCart(user.id, body.shippingAddressId);
    return created({ order });
  } catch (error) {
    return handleRouteError(error);
  }
}
