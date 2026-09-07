"use client"

import { useParams } from "next/navigation"

import { ButtonLink, MutedText } from "@/components/design-system"
import { ensureLocale, type Locale } from "@/lib/i18n"

export type RecoveryCopy = {
  title: string
  description: string
  home: string
  experience: string
  projects: string
}

export function LocalizedNotFound({ copy }: { copy: Record<Locale, RecoveryCopy> }) {
  const params = useParams<{ locale?: string }>()
  const locale = ensureLocale(params.locale)
  const labels = copy[locale]

  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <h1 id="not-found-title">{labels.title}</h1>
      <MutedText>{labels.description}</MutedText>
      <div className="not-found-actions">
        <ButtonLink href={`/${locale}`}>{labels.home}</ButtonLink>
        <ButtonLink variant="secondary" href={`/${locale}/experience`}>
          {labels.experience}
        </ButtonLink>
        <ButtonLink variant="ghost" href={`/${locale}/projects`}>
          {labels.projects}
        </ButtonLink>
        <ButtonLink variant="ghost" href="/sitemap.xml">
          Sitemap
        </ButtonLink>
        <ButtonLink variant="ghost" href="/llms.txt">
          Agent instructions
        </ButtonLink>
      </div>
    </section>
  )
}
