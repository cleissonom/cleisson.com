import { Container } from "@/components/design-system"
import type { Route } from "next"
import Link from "next/link"
import type { UiDictionary } from "@/data/i18n/types"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { SiteNavigation } from "@/components/site-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { BLOG_SLUGS_BY_LOCALE, PROJECT_SLUGS_BY_LOCALE } from "@/data/content-index"
import type { Locale } from "@/lib/i18n"
import { siteIdentity } from "@/data/profile"

export function Header({
  locale,
  ui,
  shortTitle
}: {
  locale: Locale
  ui: UiDictionary
  shortTitle: string
}) {
  const rootPath = `/${locale}`

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        {ui.labels.skipToContent}
      </a>
      <Container className="header-grid">
        <Link href={rootPath as Route} className="nameplate">
          <span>{siteIdentity.name}</span>
          <small>{shortTitle}</small>
        </Link>

        <SiteNavigation locale={locale} labels={ui.nav} label={ui.labels.mainNavigationAria} />

        <div className="header-actions">
          <LocaleSwitcher
            currentLocale={locale}
            label={ui.labels.locale}
            projectSlugsByLocale={PROJECT_SLUGS_BY_LOCALE}
            blogSlugsByLocale={BLOG_SLUGS_BY_LOCALE}
          />
          <ThemeToggle lightLabel={ui.labels.light} darkLabel={ui.labels.dark} />
        </div>
      </Container>
    </header>
  )
}
