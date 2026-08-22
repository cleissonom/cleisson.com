import { Container } from "@/components/design-system"
import type { Route } from "next"
import Link from "next/link"
import { siteIdentity } from "@/data/profile"
import type { Locale } from "@/lib/i18n"

export function Footer({
  locale,
  aboutLabel,
  resumeLabel,
  contactLabel,
  privacyLabel,
  opensInNewTabLabel
}: {
  locale: Locale
  aboutLabel: string
  resumeLabel: string
  contactLabel: string
  privacyLabel: string
  opensInNewTabLabel: string
}) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <p>
          {siteIdentity.name} | {year}
        </p>
        <div className="footer-links">
          <Link href={`/${locale}/about` as Route}>{aboutLabel}</Link>
          <a href={siteIdentity.links.github} target="_blank" rel="noreferrer">
            GitHub
            <span className="sr-only"> ({opensInNewTabLabel})</span>
          </a>
          <a href={siteIdentity.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <span className="sr-only"> ({opensInNewTabLabel})</span>
          </a>
          <Link href={`/${locale}/contact` as Route}>{contactLabel}</Link>
          <Link href={`/${locale}/privacy` as Route}>{privacyLabel}</Link>
          <a href="/rss.xml">RSS</a>
          <a href="/atom.xml">Atom</a>
          <a href="/feed.json">JSON Feed</a>
          <Link href={`/${locale}/resume` as Route}>{resumeLabel}</Link>
        </div>
      </Container>
    </footer>
  )
}
