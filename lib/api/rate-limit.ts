import { AppError } from "@/lib/api/errors";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientIpFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Simple in-memory per-IP rate limit for address APIs.
 * Process-local only — enough for abuse softening in a single Node process.
 */
export function enforceIpRateLimit(
  request: Request,
  options: { scope: string; windowMs: number; max: number; message?: string },
) {
  const key = `${options.scope}:${clientIpFromRequest(request)}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  if (current.count >= options.max) {
    throw new AppError(
      429,
      "RATE_LIMITED",
      options.message ?? "Too many requests. Please try again shortly.",
    );
  }

  current.count += 1;
}
