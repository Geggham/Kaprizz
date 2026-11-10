import { handleRouteError, ok } from "@/lib/api/response";
import { getLocale } from "@/lib/i18n/get-translator";
import { getHomeCollections } from "@/lib/server/collections";

export async function GET() {
  try {
    const locale = await getLocale();
    const collections = await getHomeCollections(locale);
    return ok({ collections });
  } catch (error) {
    return handleRouteError(error);
  }
}
