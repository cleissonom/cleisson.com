import {
  createMcpHandler,
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse
} from "@modelcontextprotocol/server"
import { createHmac, randomBytes } from "node:crypto"

import { createProfessionalEvidenceServer } from "@/lib/mcp-server"
import { SITE_DOMAIN } from "@/lib/site"

const MAX_REQUEST_BYTES = 64 * 1024
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60_000
const MAX_RATE_BUCKETS = 1_000
const RATE_KEY_SECRET = randomBytes(32)

type RateBucket = { count: number; resetAt: number }

// This bounded instance-local limiter is a backstop; production edge policy must enforce global limits.
const rateBuckets = new Map<string, RateBucket>()
const mcp = createMcpHandler(() => createProfessionalEvidenceServer(), {
  legacy: "stateless",
  maxSubscriptions: 0
})

function hostname(value: string | undefined): string | null {
  if (!value) return null
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).hostname
  } catch {
    return null
  }
}

const deploymentHosts = [
  SITE_DOMAIN,
  "cleisson.com",
  hostname(process.env.VERCEL_URL),
  hostname(process.env.VERCEL_BRANCH_URL),
  hostname(process.env.VERCEL_PROJECT_PRODUCTION_URL)
].filter((value): value is string => Boolean(value))
const allowedHosts = [...new Set([...deploymentHosts, ...localhostAllowedHostnames()])]
const allowedOrigins = [...new Set([...deploymentHosts, ...localhostAllowedOrigins()])]

function jsonError(
  status: number,
  message: string,
  options: { headers?: HeadersInit; resolution?: string } = {}
): Response {
  return Response.json(
    {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message,
        data: {
          resolution:
            options.resolution ?? "Review the MCP endpoint documentation and retry the request."
        }
      }
    },
    { status, headers: { "Cache-Control": "no-store", ...options.headers } }
  )
}

function callerKey(request: Request): string {
  for (const header of ["x-vercel-forwarded-for", "x-forwarded-for", "x-real-ip"]) {
    const value = request.headers.get(header)?.split(",", 1)[0]?.trim()
    if (value) return createHmac("sha256", RATE_KEY_SECRET).update(value).digest("base64url")
  }
  return "unknown"
}

function pruneRateBuckets(now: number): void {
  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(key)
  }
}

function rateLimitResponse(request: Request): Response | null {
  const now = Date.now()
  const key = callerKey(request)
  pruneRateBuckets(now)
  const existing = rateBuckets.get(key)
  if (!existing && rateBuckets.size >= MAX_RATE_BUCKETS) {
    const oldest = rateBuckets.keys().next().value
    if (oldest) rateBuckets.delete(oldest)
  }
  const bucket = existing ?? { count: 0, resetAt: now + RATE_WINDOW_MS }
  if (bucket.count >= RATE_LIMIT) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000))
    return jsonError(429, "Too many MCP requests", {
      headers: { "Retry-After": `${retryAfter}` },
      resolution: `Retry after ${retryAfter} seconds.`
    })
  }
  bucket.count += 1
  rateBuckets.set(key, bucket)
  return null
}

function declaredBodyTooLarge(request: Request): boolean {
  if (request.method !== "POST") return false
  const value = Number(request.headers.get("content-length"))
  return Number.isFinite(value) && value > MAX_REQUEST_BYTES
}

async function bodyTooLarge(request: Request): Promise<boolean> {
  if (request.method !== "POST") return false
  const reader = request.clone().body?.getReader()
  if (!reader) return false
  let bytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return false
      bytes += value.byteLength
      if (bytes <= MAX_REQUEST_BYTES) continue
      void reader.cancel()
      void request.body?.cancel()
      return true
    }
  } finally {
    reader.releaseLock()
  }
}

function securityResponse(request: Request): Response | undefined {
  return (
    hostHeaderValidationResponse(request, allowedHosts) ??
    originValidationResponse(request, allowedOrigins)
  )
}

function noStore(response: Response): Response {
  response.headers.set("Cache-Control", "no-store")
  return response
}

async function handle(request: Request): Promise<Response> {
  const rejected = securityResponse(request)
  if (rejected) return noStore(rejected)
  if (declaredBodyTooLarge(request)) return jsonError(413, "MCP request body is too large")
  const limited = rateLimitResponse(request)
  if (limited) return limited
  if (await bodyTooLarge(request)) return jsonError(413, "MCP request body is too large")
  return noStore(await mcp.fetch(request))
}

function methodNotAllowed(request: Request): Response {
  const rejected = securityResponse(request)
  if (rejected) return noStore(rejected)
  return jsonError(405, "Method not allowed. Use POST for MCP requests.", {
    headers: { Allow: "OPTIONS, POST" },
    resolution: "Send the MCP JSON-RPC message with HTTP POST."
  })
}

function options(request: Request): Response {
  const rejected = securityResponse(request)
  if (rejected) return noStore(rejected)
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "OPTIONS, POST",
      "Cache-Control": "no-store"
    }
  })
}

export { methodNotAllowed as DELETE, methodNotAllowed as GET, methodNotAllowed as PATCH }
export { handle as POST, methodNotAllowed as PUT }
export { options as OPTIONS }
