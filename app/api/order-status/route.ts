import { AppError } from "@/lib/api/errors";
import { handleRouteError, ok } from "@/lib/api/response";
import { getGuestOrderStatus } from "@/lib/server/checkout";
import { guestOrderStatusSchema } from "@/lib/validation/checkout";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function enforceRateLimit(request: Request) {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  if (current.count >= MAX_REQUESTS) {
    throw new AppError(429, "RATE_LIMITED", "Too many status requests");
  }
  current.count += 1;
}

export async function POST(request: Request) {
  try {
    enforceRateLimit(request);
    const { orderNumber, email } = guestOrderStatusSchema.parse(await request.json());
    const order = await getGuestOrderStatus(orderNumber, email.toLowerCase());
    if (!order) return ok({ found: false });
    return ok({ found: true, order });
  } catch (error) {
    return handleRouteError(error);
  }
}
