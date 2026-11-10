import { handleRouteError, ok } from "@/lib/api/response";
import { getShippingQuote } from "@/lib/server/shipping";
import { checkoutSummaryQuerySchema } from "@/lib/validation/checkout";

export async function GET(request: Request) {
  try {
    const { countryCode } = checkoutSummaryQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const quote = await getShippingQuote(countryCode);

    return ok({
      quote: {
        ...quote,
        price: quote.price.toNumber(),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
