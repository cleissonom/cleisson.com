export type SlugIndex = Record<string, readonly string[]>

type LocaleRouteOptions = {
  locales: readonly string[]
  projectSlugsByLocale: SlugIndex
  blogSlugsByLocale: SlugIndex
}

const STATIC_PAGES = new Set([
  "about",
  "contact",
  "privacy",
  "projects",
  "blog",
  "resume",
  "experience",
  "mcp"
])

export function isStaticPageSegment(segment: string): boolean {
  return STATIC_PAGES.has(segment)
}

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/"
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`
  return normalized.length > 1 && normalized.endsWith("/") ? normalized.slice(0, -1) : normalized
}

function pathWithoutLocale(pathname: string, locales: readonly string[]): string {
  const normalized = normalizePath(pathname)
  const segments = normalized.split("/").filter(Boolean)
  if (segments.length === 0) return "/"
  if (!locales.includes(segments[0])) return normalized
  return segments.length === 1 ? "/" : `/${segments.slice(1).join("/")}`
}

function localePath(locale: string, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

function detailPath(
  segments: string[],
  targetLocale: string,
  options: LocaleRouteOptions
): string | null {
  const [section, slug] = segments
  const indexes = section === "projects" ? options.projectSlugsByLocale : options.blogSlugsByLocale
  const slugs = indexes[targetLocale] ?? []
  return slugs.includes(slug) ? localePath(targetLocale, `/${section}/${slug}`) : null
}

export function resolveLocaleSwitchPath(
  pathname: string,
  targetLocale: string,
  options: LocaleRouteOptions
): string {
  const path = pathWithoutLocale(pathname, options.locales)
  if (path === "/") return localePath(targetLocale, "/")

  const segments = path.split("/").filter(Boolean)
  if (segments.length === 1 && isStaticPageSegment(segments[0])) {
    return localePath(targetLocale, `/${segments[0]}`)
  }
  if (segments.length === 2 && (segments[0] === "projects" || segments[0] === "blog")) {
    return detailPath(segments, targetLocale, options) ?? localePath(targetLocale, "/")
  }
  return localePath(targetLocale, "/")
}
