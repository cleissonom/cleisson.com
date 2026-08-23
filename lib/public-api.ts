import "server-only"

import { z } from "zod"

import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "@/lib/i18n"

const SUCCESS_CACHE = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
const DOCUMENTATION_PATH = "/en-US/mcp"
const TOPIC_SCHEMA = z
  .string()
  .max(80)
  .trim()
  .min(1)
  .refine((topic) => /[\p{L}\p{N}+#]/u.test(topic))
const SLUG_SCHEMA = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

type Validation<T> = { ok: true; value: T } | { ok: false; response: Response }
type Problem = {
  status: number
  code: string
  detail: string
  resolution: string
}

const PROBLEM_TITLES: Record<number, string> = {
  400: "Bad Request",
  404: "Not Found",
  405: "Method Not Allowed",
  500: "Internal Server Error"
}

function discoveryLink(): string {
  return [
    '</openapi.json>; rel="service-desc"; type="application/json"',
    `<${DOCUMENTATION_PATH}>; rel="service-doc"`
  ].join(", ")
}

function responseHeaders(cacheControl: string): HeadersInit {
  return {
    "Cache-Control": cacheControl,
    Link: discoveryLink(),
    "X-Content-Type-Options": "nosniff"
  }
}

export function apiJson(value: unknown): Response {
  return Response.json(value, { headers: responseHeaders(SUCCESS_CACHE) })
}

export function apiNoStoreJson(value: unknown): Response {
  return Response.json(value, { headers: responseHeaders("no-store") })
}

export function apiOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: { ...responseHeaders("no-store"), Allow: "GET, HEAD, OPTIONS" }
  })
}

function problemBody(request: Request, problem: Problem) {
  const instance = new URL(request.url).pathname
  return {
    type: "about:blank",
    title: PROBLEM_TITLES[problem.status],
    status: problem.status,
    detail: problem.detail,
    instance,
    code: problem.code,
    message: problem.detail,
    resolution: problem.resolution
  }
}

export function apiProblem(request: Request, problem: Problem, headers?: HeadersInit): Response {
  return Response.json(problemBody(request, problem), {
    status: problem.status,
    headers: {
      ...responseHeaders("no-store"),
      "Content-Type": "application/problem+json; charset=utf-8",
      ...headers
    }
  })
}

export async function safeApiResponse(
  request: Request,
  handler: () => Response | Promise<Response>
): Promise<Response> {
  try {
    return await handler()
  } catch {
    return apiProblem(request, {
      status: 500,
      code: "internal_error",
      detail: "The API could not complete this request.",
      resolution: "Retry later or use the contact page if the problem continues."
    })
  }
}

export function parseLocale(request: Request): Validation<Locale> {
  const value = new URL(request.url).searchParams.get("locale") ?? DEFAULT_LOCALE
  if (isLocale(value)) return { ok: true, value }
  return {
    ok: false,
    response: apiProblem(request, {
      status: 400,
      code: "invalid_locale",
      detail: "The locale query parameter is not supported.",
      resolution: `Use one of: ${LOCALES.join(", ")}.`
    })
  }
}

export function parseTopics(request: Request): Validation<string[]> {
  const values = new URL(request.url).searchParams.getAll("topics")
  const parsed = z.array(TOPIC_SCHEMA).min(1).max(10).safeParse(values)
  if (parsed.success) return { ok: true, value: parsed.data }
  return {
    ok: false,
    response: apiProblem(request, {
      status: 400,
      code: "invalid_topics",
      detail: "The topics query parameters must contain one to ten searchable terms.",
      resolution: "Repeat topics for each term; keep every value between 1 and 80 characters."
    })
  }
}

export function parseLimit(request: Request): Validation<number> {
  const value = new URL(request.url).searchParams.get("limitPerTopic")
  if (value === null) return { ok: true, value: 5 }
  if (/^[1-5]$/.test(value)) return { ok: true, value: Number(value) }
  return {
    ok: false,
    response: apiProblem(request, {
      status: 400,
      code: "invalid_limit",
      detail: "The limitPerTopic query parameter must be a whole number from 1 to 5.",
      resolution: "Omit limitPerTopic to use 5, or send an integer from 1 through 5."
    })
  }
}

export function parseProjectSlug(request: Request, value: string): Validation<string> {
  const parsed = SLUG_SCHEMA.safeParse(value)
  if (parsed.success) return { ok: true, value: parsed.data }
  return {
    ok: false,
    response: apiProblem(request, {
      status: 400,
      code: "invalid_project_slug",
      detail: "The project slug has an unsupported format.",
      resolution: "Use up to 80 lowercase letters or digits, separated only by hyphens."
    })
  }
}

export function projectNotFound(request: Request): Response {
  return apiProblem(request, {
    status: 404,
    code: "project_not_found",
    detail: "No published project case study matched this slug.",
    resolution: "Use a slug from the public projects page or inspect the project index."
  })
}

export function methodNotAllowed(request: Request): Response {
  return apiProblem(
    request,
    {
      status: 405,
      code: "method_not_allowed",
      detail: "This public API operation supports GET requests only.",
      resolution: "Retry this URL with GET, or use HEAD to inspect its response headers."
    },
    { Allow: "GET, HEAD, OPTIONS" }
  )
}

export function routeNotFound(request: Request): Response {
  return apiProblem(request, {
    status: 404,
    code: "route_not_found",
    detail: "No public API operation matches this URL.",
    resolution: "Read /openapi.json or the public API documentation for supported operations."
  })
}
