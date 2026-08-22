import { notFound } from "next/navigation"

import {
  ButtonLink,
  Chip,
  ChipRow,
  Eyebrow,
  Lead,
  PageHeader,
  SectionStack,
  Surface
} from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import { LinkedInButton } from "@/components/linkedin-button"
import { getDictionary } from "@/data/i18n"
import { siteIdentity } from "@/data/profile"
import { isLocale } from "@/lib/i18n"
import { absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd, personJsonLd } from "@/lib/schema"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = getDictionary(locale).pages.about

  return createMetadata(locale, {
    title: buildPageTitle(page.metadataTitle),
    description: page.metadataDescription,
    path: "/about"
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dictionary = getDictionary(locale)
  const page = dictionary.pages.about
  const breadcrumbs = breadcrumbJsonLd([
    { name: dictionary.ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: dictionary.ui.sections.about, url: absoluteUrl(`/${locale}/about`) }
  ])

  return (
    <SectionStack>
      <JsonLd id="about-person-jsonld" data={personJsonLd(locale, dictionary.content.about[0])} />
      <JsonLd id="about-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" aria-labelledby="about-title">
        <PageHeader>
          <Eyebrow>{dictionary.ui.sections.about}</Eyebrow>
          <h1 id="about-title">{siteIdentity.name}</h1>
          <Lead>{page.lead}</Lead>
        </PageHeader>
        <div className="markdown content-prose">
          <h2>{page.profileHeading}</h2>
          {dictionary.content.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Surface>

      <Surface as="section" aria-labelledby="about-focus-title">
        <h2 id="about-focus-title">{page.focusHeading}</h2>
        <ChipRow>
          {dictionary.content.focusAreas.map((area) => (
            <Chip key={area}>{area}</Chip>
          ))}
        </ChipRow>
      </Surface>

      <Surface as="section" aria-labelledby="about-links-title">
        <h2 id="about-links-title">{page.linksHeading}</h2>
        <div className="hero-actions">
          <ButtonLink href={`/${locale}/experience`}>{dictionary.ui.nav.experience}</ButtonLink>
          <ButtonLink variant="secondary" href={`/${locale}/resume`}>
            {dictionary.ui.nav.resume}
          </ButtonLink>
          <LinkedInButton
            label={dictionary.ui.cta.linkedin}
            opensInNewTabLabel={dictionary.ui.labels.opensInNewTab}
          />
        </div>
      </Surface>
    </SectionStack>
  )
}
