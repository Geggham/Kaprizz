import { UserRole } from "@/generated/prisma/client";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import {
  createAdminShippingCountry,
  listAdminShippingCountries,
} from "@/lib/server/admin-shipping";
import { shippingCountrySchema } from "@/lib/validation/admin-shipping";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ countries: await listAdminShippingCountries() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    const country = await createAdminShippingCountry(shippingCountrySchema.parse(await request.json()));
    return created({ country });
  } catch (error) {
    return handleRouteError(error);
  }
}
