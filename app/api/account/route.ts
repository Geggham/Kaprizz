import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import { getUserProfile, updateUserProfile } from "@/lib/server/users";
import { updateProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const authUser = await requireUser();
    const user = await getUserProfile(authUser.id);
    return ok({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const authUser = await requireUser();
    const body = updateProfileSchema.parse(await request.json());
    const user = await updateUserProfile(authUser.id, body);
    return ok({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
