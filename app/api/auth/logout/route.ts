import { handleRouteError, ok } from "@/lib/api/response";
import { logoutUser } from "@/lib/server/auth";

export async function POST() {
  try {
    await logoutUser();
    return ok({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
