import { notFound } from "next/navigation"

import { ButtonLink } from "@/components/design-system"
import { TrustPage } from "@/components/trust-page"
import { getDictionary } from "@/data/i18n"
import { isLocale } from "@/lib/i18n"
import { buildPageTitle, createMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const page = getDictionary(locale).pages.privacy

  return createMetadata(locale, {
    title: buildPageTitle(page.metadataTitle),
    description: page.metadataDescription,
    path: "/privacy"
  })
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dictionary = getDictionary(locale)
  const page = dictionary.pages.privacy

  return (
    <TrustPage
      eyebrow={page.metadataTitle}
      title={page.metadataTitle}
      lead={page.lead}
      sections={page.sections}
      actions={<ButtonLink href={`/${locale}/contact`}>{dictionary.ui.cta.contact}</ButtonLink>}
    />
  )
}
