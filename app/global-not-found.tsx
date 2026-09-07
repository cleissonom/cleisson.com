import "@/app/globals.css"

import Link from "next/link"
import { headers } from "next/headers"

import { getDictionary } from "@/data/i18n"
import { ensureLocale } from "@/lib/i18n"
import { ThemeScript } from "@/components/theme-script"
import { SITE_NAME } from "@/lib/site"

export default async function GlobalNotFound() {
  const locale = ensureLocale((await headers()).get("x-recovery-locale"))
  const { ui } = getDictionary(locale)

  return (
    <html lang={locale} data-theme="light" suppressHydrationWarning>
      <head>
        <title>{`${ui.labels.notFoundTitle} | ${SITE_NAME}`}</title>
        <meta name="description" content={ui.labels.notFoundDescription} />
        <meta name="robots" content="noindex, follow" />
      </head>
      <body>
        <ThemeScript />
        <main id="main-content" tabIndex={-1} className="container not-found">
          <h1>{ui.labels.notFoundTitle}</h1>
          <p>{ui.labels.notFoundDescription}</p>
          <div className="not-found-actions">
            <Link className="primary-button" href={`/${locale}`}>
              {ui.labels.goHome}
            </Link>
            <a className="secondary-button" href="/sitemap.xml">
              Sitemap
            </a>
            <a className="ghost-button" href="/llms.txt">
              Agent instructions
            </a>
            <Link className="ghost-button" href={`/${locale}/projects`}>
              {ui.nav.projects}
            </Link>
            <Link className="ghost-button" href={`/${locale}/blog`}>
              {ui.nav.blog}
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
