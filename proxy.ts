import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import {
  appendNegotiationVary,
  preferredRepresentation,
  type Representation
} from "@/lib/content-negotiation"
import { BLOG_SLUGS_BY_LOCALE, PROJECT_SLUGS_BY_LOCALE } from "@/data/content-index"
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isLocale,
  looksLikeLocale,
  toLocalePath,
  type Locale
} from "@/lib/i18n"
import { isStaticPageSegment } from "@/lib/locale-route"

const PUBLIC_FILE = /\.[^/]+$/
const NOT_FOUND_SEGMENT = "__agent-recovery-404__"

type LanguagePreference = {
  tag: string
  quality: number
}

type NegotiationContext = {
  request: NextRequest
  pathname: string
  segments: string[]
  locale: Locale
  representation: Representation | null
}

function parseAcceptLanguage(headerValue: string): LanguagePreference[] {
  return headerValue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [tagRaw, ...params] = part.split(";").map((value) => value.trim())
      const qualityParam = params.find((param) => param.startsWith("q="))
      const parsedQuality = qualityParam ? Number.parseFloat(qualityParam.slice(2)) : 1

      return {
        tag: tagRaw.toLowerCase(),
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 1
      }
    })
    .sort((a, b) => b.quality - a.quality)
}

function localeFromLanguageTag(tag: string): Locale | null {
  if (tag.startsWith("pt")) {
    return "pt-BR"
  }

  if (tag.startsWith("es")) {
    return "es-ES"
  }

  if (tag.startsWith("en")) {
    return "en-US"
  }

  return null
}

function preferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  if (isLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = request.headers.get("accept-language") ?? ""
  const preferences = parseAcceptLanguage(acceptLanguage)

  for (const preference of preferences) {
    const detected = localeFromLanguageTag(preference.tag)
    if (detected) {
      return detected
    }
  }

  return DEFAULT_LOCALE
}

function withLocaleCookie(response: NextResponse, locale: Locale): NextResponse {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true
  })

  return response
}

function isKnownPage(segments: string[], locale: Locale): boolean {
  if (segments.length === 0) return true
  if (segments.length === 1) return isStaticPageSegment(segments[0])
  if (segments.length !== 2) return false

  const [section, slug] = segments
  if (section === "projects") return PROJECT_SLUGS_BY_LOCALE[locale].includes(slug)
  if (section === "blog") return BLOG_SLUGS_BY_LOCALE[locale].includes(slug)
  return false
}

function markdownSibling(pathname: string): string {
  if (pathname === "/") return "/index.md"
  const normalized = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
  return `${normalized}.md`
}

function withAgentDiscovery(response: NextResponse, pathname: string): NextResponse {
  appendNegotiationVary(response.headers)
  response.headers.set(
    "Link",
    `<${markdownSibling(pathname)}>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"`
  )
  return response
}

function markdownResponse(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = `/api/markdown${pathname}`
  const response = NextResponse.rewrite(url)
  appendNegotiationVary(response.headers)
  return response
}

function notAcceptableResponse(): NextResponse {
  const response = new NextResponse(
    "Not Acceptable\n\nThis resource is available as:\n- text/html\n- text/markdown\n",
    {
      status: 406,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8"
      }
    }
  )
  appendNegotiationVary(response.headers)
  return response
}

function notFoundRewrite(request: NextRequest, locale: Locale): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}/${NOT_FOUND_SEGMENT}`
  return NextResponse.rewrite(url)
}

function explicitMarkdownPath(pathname: string, locale: Locale): string {
  const sourcePath = pathname === "/index.md" ? "/" : pathname.slice(0, -3)
  const segments = sourcePath.split("/").filter(Boolean)
  const firstSegment = segments[0]

  if (!firstSegment) return `/${locale}`
  if (isLocale(firstSegment)) return `/${segments.join("/")}`
  if (looksLikeLocale(firstSegment)) return `/${DEFAULT_LOCALE}/${segments.slice(1).join("/")}`
  return toLocalePath(locale, sourcePath)
}

function isFrameworkComponentRequest(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? ""
  const acceptsComponent = accept
    .split(",")
    .some((range) => range.split(";", 1)[0].trim().toLowerCase() === "text/x-component")
  const hasFrameworkSignal =
    request.headers.get("rsc") === "1" ||
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.has("next-action")
  return acceptsComponent && hasFrameworkSignal
}

function negotiatedResponse(
  request: NextRequest,
  localizedPath: string,
  representation: Representation | null,
  knownPageShape: boolean,
  htmlResponse: () => NextResponse
): NextResponse {
  if (isFrameworkComponentRequest(request)) return htmlResponse()
  if (representation === "text/markdown") return markdownResponse(request, localizedPath)
  if (representation === null && knownPageShape) return notAcceptableResponse()
  return withAgentDiscovery(htmlResponse(), localizedPath)
}

function negotiationContext(request: NextRequest): NegotiationContext {
  const { pathname } = request.nextUrl
  return {
    request,
    pathname,
    segments: pathname.split("/").filter(Boolean),
    locale: preferredLocale(request),
    representation: preferredRepresentation(request.headers.get("accept"))
  }
}

function shouldBypass(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api") ||
    pathname.endsWith(`/${NOT_FOUND_SEGMENT}`) ||
    pathname === "/favicon.ico"
  )
}

function rootResponse(context: NegotiationContext): NextResponse {
  const { request, locale, representation } = context
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}`
  const response = negotiatedResponse(request, url.pathname, representation, true, () =>
    NextResponse.rewrite(url)
  )
  return withLocaleCookie(response, locale)
}

function localizedResponse(context: NegotiationContext): NextResponse {
  const { request, pathname, segments, representation } = context
  const pathLocale = segments[0] as Locale
  const knownPage = isKnownPage(segments.slice(1), pathLocale)
  return negotiatedResponse(request, pathname, representation, knownPage, () =>
    knownPage ? NextResponse.next() : notFoundRewrite(request, pathLocale)
  )
}

function unsupportedLocaleResponse(context: NegotiationContext): NextResponse {
  const { request, segments } = context
  const url = request.nextUrl.clone()
  const rest = segments.slice(1).join("/")
  url.pathname = `/${DEFAULT_LOCALE}${rest ? `/${rest}` : ""}`
  return withLocaleCookie(NextResponse.redirect(url), DEFAULT_LOCALE)
}

function unlocalizedResponse(context: NegotiationContext): NextResponse {
  const { request, pathname, segments, locale, representation } = context
  const url = request.nextUrl.clone()
  url.pathname = toLocalePath(locale, pathname)
  const knownPage = isKnownPage(segments, locale)
  const response = knownPage
    ? NextResponse.redirect(url)
    : negotiatedResponse(request, url.pathname, representation, false, () =>
        notFoundRewrite(request, locale)
      )
  return withLocaleCookie(response, locale)
}

export function proxy(request: NextRequest) {
  const context = negotiationContext(request)
  const { pathname, segments, locale } = context
  if (shouldBypass(pathname)) return NextResponse.next()
  if (pathname.endsWith(".md"))
    return markdownResponse(request, explicitMarkdownPath(pathname, locale))
  if (PUBLIC_FILE.test(pathname)) return NextResponse.next()
  if (segments.length === 0) return rootResponse(context)

  const firstSegment = segments[0]
  if (isLocale(firstSegment)) return localizedResponse(context)
  if (looksLikeLocale(firstSegment)) return unsupportedLocaleResponse(context)
  return unlocalizedResponse(context)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_vercel).*)"]
}
