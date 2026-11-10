import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import { deleteAddress, updateAddress } from "@/lib/server/users";
import { addressSchema } from "@/lib/validation/schemas";

type RouteContext = {
  params: Promise<{ addressId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { addressId } = await context.params;
    const body = addressSchema.parse(await request.json());
    const address = await updateAddress(user.id, addressId, body);
    return ok({ address });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { addressId } = await context.params;
    const result = await deleteAddress(user.id, addressId);
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
