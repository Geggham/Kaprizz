import { created, handleRouteError } from "@/lib/api/response";
import { registerUser } from "@/lib/server/auth";
import { registerSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const user = await registerUser(body);
    return created({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
