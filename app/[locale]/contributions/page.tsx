import Image from "next/image"
import { notFound } from "next/navigation"

import { Lead, PageHeader, SectionStack } from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import {
  STARS_CHECKED_AT,
  formatPullRequestCount,
  formatStars,
  getContributionGroups,
  getContributions,
  getContributionsCopy,
  type Contribution,
  type ContributionGroup
} from "@/data/contributions"
import { getDictionary } from "@/data/i18n"
import { formatContentDate } from "@/lib/display-date"
import { isLocale, type Locale } from "@/lib/i18n"
import { absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd } from "@/lib/schema"
import { SITE_NAME } from "@/lib/site"

import styles from "./contributions.module.css"

type PageProps = { params: Promise<{ locale: string }> }

const dateOptions = { day: "numeric", month: "short", year: "numeric" } as const

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

function PullRequestItem({ item, locale }: { item: Contribution; locale: Locale }) {
  const copy = getContributionsCopy(locale)
  return (
    <li className={styles.pullRequest}>
      <p className={styles.title}>{item.title}</p>
      <p className={styles.meta}>
        <a href={item.url}>
          {copy.pullRequestLabel} #{item.number}
        </a>
        {` · ${copy.mergedLabel} `}
        <time dateTime={item.mergedAt}>
          {formatContentDate(item.mergedAt, locale, dateOptions)}
        </time>
      </p>
    </li>
  )
}

function RepositoryGroup({
  group,
  locale,
  open
}: {
  group: ContributionGroup
  locale: Locale
  open: boolean
}) {
  return (
    <li>
      <details className={styles.group} open={open}>
        <summary className={styles.summary}>
          <ProjectMark organization={group.organization} />
          <span className={styles.identity}>
            <span className={styles.project}>{group.project}</span>
            <span className={styles.organization}>{group.organization}</span>
          </span>
          <span className={styles.stats}>
            <span>{formatPullRequestCount(group.contributions.length, locale)}</span>
            <span>
              <span aria-hidden="true">★ </span>
              {formatStars(group.stars, locale)}
            </span>
          </span>
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <div className={styles.content}>
          <a className={styles.repository} href={group.url}>
            {group.repository}
          </a>
          <ol className={styles.pullRequests} role="list">
            {group.contributions.map((item) => (
              <PullRequestItem key={item.id} item={item} locale={locale} />
            ))}
          </ol>
        </div>
      </details>
    </li>
  )
}

export default async function ContributionsPage({ params }: PageProps) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const { title, lead, starsCheckedLabel } = getContributionsCopy(locale)
  const rows = getContributions(locale)
  const url = absoluteUrl(`/${locale}/contributions`)
  const breadcrumbs = breadcrumbJsonLd([
    { name: getDictionary(locale).ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: title, url }
  ])
  const starsChecked = formatContentDate(STARS_CHECKED_AT, locale, dateOptions)
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
      <div>
        <ul className={styles.list} role="list">
          {getContributionGroups(locale).map((group, index) => (
            <RepositoryGroup
              key={group.repository}
              group={group}
              locale={locale}
              open={index === 0}
            />
          ))}
        </ul>
        <p className={styles.note}>{`${starsCheckedLabel} ${starsChecked}.`}</p>
      </div>
    </SectionStack>
  )
}
