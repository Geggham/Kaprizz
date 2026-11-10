import { handleRouteError, ok } from "@/lib/api/response";
import { loginUser } from "@/lib/server/auth";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await loginUser(body);
    return ok({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
