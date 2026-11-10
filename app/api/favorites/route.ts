import { requireUser } from "@/lib/auth/guards";
import { handleRouteError, ok } from "@/lib/api/response";
import {
  addFavorite,
  listFavoriteProductIds,
  listFavoriteProducts,
} from "@/lib/server/favorites";
import { favoriteSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const full = searchParams.get("full") === "1";

    if (full) {
      const products = await listFavoriteProducts(user.id);
      return ok({ products, productIds: products.map((product) => product.id) });
    }

    const productIds = await listFavoriteProductIds(user.id);
    return ok({ productIds });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = favoriteSchema.parse(await request.json());
    const productIds = await addFavorite(user.id, body.productId);
    return ok({ productIds });
  } catch (error) {
    return handleRouteError(error);
  }
}
