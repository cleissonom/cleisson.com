import "server-only"

import { createHmac, randomBytes } from "node:crypto"

const MAX_BUCKETS = 1_000

type RateBucket = { count: number; resetAt: number }

export function createRequestRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, RateBucket>()
  const keySecret = randomBytes(32)

  return (request: Request): number | null => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }

    const key = callerKey(request, keySecret)
    const existing = buckets.get(key)
    if (!existing && buckets.size >= MAX_BUCKETS) {
      const oldest = buckets.keys().next().value
      if (oldest) buckets.delete(oldest)
    }

    const bucket = existing ?? { count: 0, resetAt: now + windowMs }
    if (bucket.count >= limit) return Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000))

    bucket.count += 1
    buckets.set(key, bucket)
    return null
  }
}

function callerKey(request: Request, keySecret: Buffer): string {
  for (const header of ["x-vercel-forwarded-for", "x-forwarded-for", "x-real-ip"]) {
    const value = request.headers.get(header)?.split(",", 1)[0]?.trim()
    if (value) return createHmac("sha256", keySecret).update(value).digest("base64url")
  }
  return "unknown"
}
