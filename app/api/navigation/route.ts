import { handleRouteError, ok } from "@/lib/api/response";
import { getLocale } from "@/lib/i18n/get-translator";
import { getNavigation } from "@/lib/server/navigation";

export async function GET() {
  try {
    const locale = await getLocale();
    const items = await getNavigation(locale);
    return ok({ items });
  } catch (error) {
    return handleRouteError(error);
  }
}
