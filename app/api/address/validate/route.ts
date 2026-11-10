import { enforceIpRateLimit } from "@/lib/api/rate-limit";
import { handleRouteError, ok } from "@/lib/api/response";
import { validateDeliveryAddress } from "@/lib/server/address";
import { addressValidateSchema } from "@/lib/validation/address";

export async function POST(request: Request) {
  try {
    enforceIpRateLimit(request, {
      scope: "address-validate",
      windowMs: 60_000,
      max: 15,
      message: "Too many validation requests",
    });

    const body = addressValidateSchema.parse(await request.json());
    const result = await validateDeliveryAddress({
      countryCode: body.countryCode,
      administrativeArea: body.administrativeArea ?? undefined,
      city: body.city,
      postalCode: body.postalCode ?? undefined,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2 ?? undefined,
    });

    return ok({ result });
  } catch (error) {
    return handleRouteError(error);
  }
}
