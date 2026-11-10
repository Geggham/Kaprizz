import { unauthorized } from "@/lib/api/errors";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/guards";
import { sendOrderConfirmation } from "@/lib/email/send-order-confirmation";
import {
  createCheckoutOrder,
  getCheckoutSummary,
} from "@/lib/server/checkout";
import {
  checkoutInputSchema,
  checkoutPreviewSchema,
  checkoutSummaryQuerySchema,
} from "@/lib/validation/checkout";

const CONFIRMATION_COOKIE = "kapriz_order_confirmation";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw unauthorized();
    const { countryCode } = checkoutSummaryQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return ok({ summary: await getCheckoutSummary({ countryCode, userId: user.id }) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const preview = checkoutPreviewSchema.safeParse(body);
    const user = await getCurrentUser();

    if (preview.success) {
      return ok({
        summary: await getCheckoutSummary({
          countryCode: preview.data.countryCode,
          userId: user?.id,
          cartItems: preview.data.cartItems,
        }),
      });
    }

    const input = checkoutInputSchema.parse(body);
    const result = await createCheckoutOrder(input, user);
    const email = user?.email ?? input.contact?.email;
    const firstName = user?.firstName ?? input.contact?.firstName ?? "";
    const emailResult =
      result.reused || !email
        ? { delivered: false }
        : await sendOrderConfirmation({
            to: email,
            customerFirstName: firstName,
            orderNumber: result.order.orderNumber,
            total: result.order.total.toFixed(2),
            currency: result.order.currency,
            subtotal: result.order.subtotal.toFixed(2),
            shipping: result.order.shippingCost.toFixed(2),
            items: result.order.items.map((item) => ({
              productName: item.productName,
              colorName: item.colorName,
              size: item.size,
              quantity: item.quantity,
              totalPrice: item.totalPrice.toFixed(2),
            })),
            deliveryCity: result.order.city,
            deliveryCountry: result.order.country,
            estimatedDelivery:
              result.order.estimatedMinDays &&
              result.order.estimatedMaxDays
                ? `${result.order.estimatedMinDays}–${result.order.estimatedMaxDays} business days`
                : undefined,
            status: result.order.status,
          });
    const response = created({
      order: result.order,
      reused: result.reused,
      emailDelivered: emailResult.delivered,
    });

    if (result.confirmationToken) {
      response.cookies.set(CONFIRMATION_COOKIE, result.confirmationToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
