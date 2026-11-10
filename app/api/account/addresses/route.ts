import { requireUser } from "@/lib/auth/guards";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { createAddress, listAddresses } from "@/lib/server/users";
import { addressSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await listAddresses(user.id);
    return ok({ addresses });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = addressSchema.parse(await request.json());
    const address = await createAddress(user.id, body);
    return created({ address });
  } catch (error) {
    return handleRouteError(error);
  }
}
