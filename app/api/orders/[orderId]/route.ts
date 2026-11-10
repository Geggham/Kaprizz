import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import { getOrderForUser } from "@/lib/server/orders";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { orderId } = await context.params;
    const order = await getOrderForUser(user.id, orderId);
    return ok({ order });
  } catch (error) {
    return handleRouteError(error);
  }
}
