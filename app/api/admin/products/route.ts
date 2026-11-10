import { UserRole } from "@/generated/prisma/client";
import { created, handleRouteError, ok } from "@/lib/api/response";
import { requireRole } from "@/lib/auth/guards";
import { createAdminProduct, listAdminProducts } from "@/lib/server/admin-products";
import { adminProductSchema } from "@/lib/validation/admin-products";

export async function GET() {
  try {
    await requireRole(UserRole.ADMIN);
    return ok({ products: await listAdminProducts() });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    const input = adminProductSchema.parse(await request.json());
    return created({ product: await createAdminProduct(input) });
  } catch (error) {
    return handleRouteError(error);
  }
}
