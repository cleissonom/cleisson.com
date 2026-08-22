import type { ReactNode } from "react"

import { Eyebrow, Lead, PageHeader, SectionStack, Surface } from "@/components/design-system"
import type { ContentSection } from "@/data/i18n/types"

export function TrustPage({
  eyebrow,
  title,
  lead,
  sections,
  actions
}: {
  eyebrow: string
  title: string
  lead: string
  sections: ContentSection[]
  actions?: ReactNode
}) {
  return (
    <SectionStack>
      <Surface as="section" aria-labelledby="trust-page-title">
        <PageHeader>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 id="trust-page-title">{title}</h1>
          <Lead>{lead}</Lead>
        </PageHeader>
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </Surface>

      {sections.map((section) => (
        <Surface as="section" className="markdown content-prose" key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Surface>
      ))}
    </SectionStack>
  )
}
