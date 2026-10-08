// Simple in-memory rate-limiter to prevent abuse (IP-based, resets every minute)
export const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const RATE_LIMIT_WINDOW = 60000;
export const MAX_REQUESTS = 10;

export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
  // Clean up old entries
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false; // Exceeded limit
  }

  entry.count += 1;
  return true;
}
