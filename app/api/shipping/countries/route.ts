import { handleRouteError, ok } from "@/lib/api/response";
import { getActiveShippingCountries } from "@/lib/server/shipping";

export async function GET() {
  try {
    const countries = await getActiveShippingCountries();
    return ok({ countries });
  } catch (error) {
    return handleRouteError(error);
  }
}
