import { cookies } from "next/headers";
import { handleRouteError, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/guards";
import { getConfirmationOrder } from "@/lib/server/checkout";

const CONFIRMATION_COOKIE = "kapriz_order_confirmation";

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const [{ orderNumber }, user, cookieStore] = await Promise.all([
      context.params,
      getCurrentUser(),
      cookies(),
    ]);
    const order = await getConfirmationOrder({
      orderNumber,
      userId: user?.id,
      confirmationToken: cookieStore.get(CONFIRMATION_COOKIE)?.value,
    });

    return ok({
      order: {
        ...order,
        email: user ? undefined : undefined,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
