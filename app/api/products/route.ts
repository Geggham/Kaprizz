import type { ProductModel } from "@/generated/prisma/client";
import { handleRouteError, ok } from "@/lib/api/response";
import { listProducts } from "@/lib/server/products";
import { productQuerySchema } from "@/lib/validation/schemas";

const modelMap: Record<string, ProductModel> = {
  Oxford: "OXFORD",
  Derby: "DERBY",
  Loafer: "LOAFER",
  "Monk Strap": "MONK_STRAP",
  Boot: "BOOT",
  "Mary Jane": "MARY_JANE",
  Pump: "PUMP",
  "Ballet Flat": "BALLET_FLAT",
  Slingback: "SLINGBACK",
  OXFORD: "OXFORD",
  DERBY: "DERBY",
  LOAFER: "LOAFER",
  MONK_STRAP: "MONK_STRAP",
  BOOT: "BOOT",
  MARY_JANE: "MARY_JANE",
  PUMP: "PUMP",
  BALLET_FLAT: "BALLET_FLAT",
  SLINGBACK: "SLINGBACK",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = productQuerySchema.parse(Object.fromEntries(searchParams));

    const gender =
      parsed.gender === undefined
        ? undefined
        : parsed.gender.toUpperCase() === "MEN"
          ? ("MEN" as const)
          : ("WOMEN" as const);

    const model = parsed.model ? modelMap[parsed.model] : undefined;

    const result = await listProducts({
      gender,
      model,
      color: parsed.color,
      size: parsed.size,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      isNew: parsed.isNew,
      isBestSeller: parsed.isBestSeller,
      isFeatured: parsed.isFeatured,
      sort: parsed.sort,
      page: parsed.page,
      limit: parsed.limit,
    });

    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
