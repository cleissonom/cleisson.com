import Image from "next/image"
import { notFound } from "next/navigation"

import { Lead, PageHeader, SectionStack } from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import { getContributions, getContributionsCopy, type Contribution } from "@/data/contributions"
import { getDictionary } from "@/data/i18n"
import { formatContentDate } from "@/lib/display-date"
import { isLocale, type Locale } from "@/lib/i18n"
import { absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd } from "@/lib/schema"
import { SITE_NAME } from "@/lib/site"

import styles from "./contributions.module.css"

type PageProps = { params: Promise<{ locale: string }> }

const logos = {
  "Amazon Web Services": { name: "aws", width: 72, height: 43, dark: true },
  "Netflix Skunkworks": { name: "netflix", width: 26, height: 47, dark: false },
  "Django Software Foundation": { name: "django", width: 90, height: 32, dark: true }
} as const

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const { title, lead } = getContributionsCopy(locale)
  return createMetadata(locale, {
    title: buildPageTitle(title),
    description: lead,
    imageAlt: SITE_NAME,
    path: "/contributions"
  })
}

function ProjectMark({ organization }: { organization: Contribution["organization"] }) {
  const logo = logos[organization]
  return (
    <span className={styles.mark} aria-hidden="true">
      <Image
        className={logo.dark ? styles.lightMark : undefined}
        src={`/contributions/${logo.name}.webp`}
        width={logo.width}
        height={logo.height}
        alt=""
        unoptimized
      />
      {logo.dark && (
        <Image
          className={styles.darkMark}
          src={`/contributions/${logo.name}-dark.webp`}
          width={logo.width}
          height={logo.name === "django" ? 39 : logo.height}
          alt=""
          unoptimized
        />
      )}
    </span>
  )
}

function ContributionRow({ item, locale }: { item: Contribution; locale: Locale }) {
  const copy = getContributionsCopy(locale)
  const date = formatContentDate(item.mergedAt, locale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
  return (
    <li className={styles.row}>
      <div className={styles.identity}>
        <ProjectMark organization={item.organization} />
        <div>
          <p className={styles.project}>{item.project}</p>
          <p className={styles.organization}>{item.organization}</p>
        </div>
      </div>
      <div className={styles.change}>
        <h2 id={item.id}>{item.title}</h2>
      </div>
      <div className={styles.source}>
        <a href={item.url}>
          {copy.pullRequestLabel} #{item.number}
        </a>
        <p>
          {copy.mergedLabel} <time dateTime={item.mergedAt}>{date}</time>
        </p>
      </div>
    </li>
  )
}

export default async function ContributionsPage({ params }: PageProps) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const { title, lead } = getContributionsCopy(locale)
  const rows = getContributions(locale)
  const url = absoluteUrl(`/${locale}/contributions`)
  const breadcrumbs = breadcrumbJsonLd([
    { name: getDictionary(locale).ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: title, url }
  ])
  return (
    <SectionStack aria-labelledby="contributions-title">
      <JsonLd id="contributions-breadcrumb-jsonld" data={breadcrumbs} />
      <JsonLd
        id="contributions-collection-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description: lead,
          inLanguage: locale,
          url,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: rows.map((row, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: row.title,
              url: row.url
            }))
          }
        }}
      />
      <PageHeader className="page-overview-copy">
        <h1 id="contributions-title">{title}</h1>
        <Lead>{lead}</Lead>
      </PageHeader>
      <ul className={styles.list} role="list">
        {rows.map((item) => (
          <ContributionRow key={item.id} item={item} locale={locale} />
        ))}
      </ul>
    </SectionStack>
  )
}
