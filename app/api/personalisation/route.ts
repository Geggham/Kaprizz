import { requireUser } from "@/lib/auth/guards";
import { created, handleRouteError, ok } from "@/lib/api/response";
import {
  createPersonalisationRequest,
  listPersonalisationRequests,
} from "@/lib/server/personalisation";
import { personalisationSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireUser();
    const requests = await listPersonalisationRequests(user.id);
    return ok({ requests });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = personalisationSchema.parse(await request.json());
    const personalisationRequest = await createPersonalisationRequest(user.id, {
      productId: body.productId,
      variantId: body.variantId,
      type: body.type,
      value: body.value,
      notes: body.notes,
    });
    return created({ request: personalisationRequest });
  } catch (error) {
    return handleRouteError(error);
  }
}
