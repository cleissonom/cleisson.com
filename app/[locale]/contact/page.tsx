import { notFound } from "next/navigation"

import { ButtonLink } from "@/components/design-system"
import { TrustPage } from "@/components/trust-page"
import { getDictionary } from "@/data/i18n"
import { isLocale } from "@/lib/i18n"
import { buildPageTitle, createMetadata } from "@/lib/metadata"
import { siteEmailHref } from "@/lib/site"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = getDictionary(locale).pages.contact

  return createMetadata(locale, {
    title: buildPageTitle(page.metadataTitle),
    description: page.metadataDescription,
    path: "/contact"
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dictionary = getDictionary(locale)
  const page = dictionary.pages.contact

  return (
    <TrustPage
      eyebrow={dictionary.ui.cta.contact}
      title={page.metadataTitle}
      lead={page.lead}
      sections={page.sections}
      actions={
        <>
          <ButtonLink href={siteEmailHref(locale)}>{dictionary.ui.cta.contact}</ButtonLink>
          <ButtonLink variant="secondary" href={`/${locale}/resume`}>
            {dictionary.ui.nav.resume}
          </ButtonLink>
        </>
      }
    />
  )
}
