import { notFound } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import {
  getProductBySlug,
  getRecommendedProducts,
} from "@/lib/server/products";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      throw notFound("Product not found");
    }

    const recommendations = await getRecommendedProducts(product);

    return ok({ product, recommendations });
  } catch (error) {
    return handleRouteError(error);
  }
}
