import { Card, Chip, ChipRow, InlineLink } from "@/components/design-system"
import type { Route } from "next"
import Image from "next/image"
import Link from "next/link"
import type { ProjectEntry } from "@/lib/content"
import type { projectCardImageVariant } from "@/lib/devimg"
import type { Locale } from "@/lib/i18n"
import { isProjectDetailAvailable } from "@/lib/project-state"

export type ProjectCardProject = Pick<
  ProjectEntry,
  "slug" | "title" | "summary" | "role" | "type" | "stage" | "tags"
>

export type ProjectCardImage = ReturnType<typeof projectCardImageVariant>

export function ProjectCard({
  project,
  cardImage,
  locale,
  readMoreLabel,
  readMoreAboutPrefix,
  detailsUnavailableLabel,
  typeLabel,
  stageLabel,
  headingLevel = 3
}: {
  project: ProjectCardProject
  cardImage: ProjectCardImage | null
  locale: Locale
  readMoreLabel: string
  readMoreAboutPrefix: string
  detailsUnavailableLabel: string
  typeLabel: string
  stageLabel: string
  headingLevel?: 2 | 3
}) {
  const contextLabel = `${readMoreAboutPrefix} ${project.title}`
  const descriptiveLabel = `${readMoreLabel} ${contextLabel}`
  const hasPublicDetails = isProjectDetailAvailable(project)
  const detailHref = `/${locale}/projects/${project.slug}` as Route
  const Heading = headingLevel === 2 ? "h2" : "h3"

  return (
    <Card className={hasPublicDetails ? "project-card" : "project-card project-card-in-progress"}>
      {!hasPublicDetails ? (
        <div className="project-card-preview-heading">
          <p className="project-card-detail-status">{detailsUnavailableLabel}</p>
          <Heading>{project.title}</Heading>
        </div>
      ) : null}
      {cardImage ? (
        <div className="card-banner-shell">
          <Image
            className={`card-banner-image${cardImage.fit === "contain" ? " card-banner-image-contain" : ""}`}
            src={cardImage.src}
            alt=""
            width={cardImage.width}
            height={cardImage.height}
            loading="lazy"
            unoptimized
          />
        </div>
      ) : null}
      {hasPublicDetails ? (
        <Heading>
          <Link href={detailHref}>{project.title}</Link>
        </Heading>
      ) : null}
      <div className="project-card-meta-row" aria-label={`${typeLabel} | ${stageLabel}`}>
        <span>{typeLabel}</span>
        <span className={`project-card-stage project-card-stage-${project.stage}`}>
          {stageLabel}
        </span>
      </div>
      <p className="card-meta">{project.role}</p>
      <p>{project.summary}</p>
      <ChipRow>
        {project.tags.map((tag) => (
          <Chip key={`${project.slug}-${tag}`}>{tag}</Chip>
        ))}
      </ChipRow>
      {hasPublicDetails ? (
        <InlineLink href={detailHref} aria-label={descriptiveLabel}>
          {readMoreLabel}
          <span className="sr-only"> {contextLabel}</span>
        </InlineLink>
      ) : null}
    </Card>
  )
}
