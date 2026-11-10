import { enforceIpRateLimit } from "@/lib/api/rate-limit";
import { handleRouteError, ok } from "@/lib/api/response";
import { suggestAddresses } from "@/lib/server/address";
import { addressAutocompleteQuerySchema } from "@/lib/validation/address";

export async function GET(request: Request) {
  try {
    enforceIpRateLimit(request, {
      scope: "address-autocomplete",
      windowMs: 60_000,
      max: 40,
      message: "Too many autocomplete requests",
    });

    const { searchParams } = new URL(request.url);
    const input = addressAutocompleteQuerySchema.parse({
      query: searchParams.get("query") ?? "",
      countryCode: searchParams.get("countryCode") ?? "",
    });

    const result = await suggestAddresses(input.query, input.countryCode);
    return ok({
      suggestions: result.suggestions,
      available: result.available,
      source: result.source,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
