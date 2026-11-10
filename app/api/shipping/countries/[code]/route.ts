import { handleRouteError, ok } from "@/lib/api/response";
import { getShippingCountryByCode } from "@/lib/server/shipping";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { code } = await context.params;
    const country = await getShippingCountryByCode(code);
    return ok({ country });
  } catch (error) {
    return handleRouteError(error);
  }
}
