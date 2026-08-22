import { BLOG_SLUGS_BY_LOCALE, PROJECT_SLUGS_BY_LOCALE } from "@/data/content-index"
import { LOCALES, type Locale } from "@/lib/i18n"
import { resolveLocaleSwitchPath as resolvePath } from "@/lib/locale-route"

export function resolveLocaleSwitchPath(pathname: string, targetLocale: Locale): string {
  return resolvePath(pathname, targetLocale, {
    locales: LOCALES,
    projectSlugsByLocale: PROJECT_SLUGS_BY_LOCALE,
    blogSlugsByLocale: BLOG_SLUGS_BY_LOCALE
  })
}
