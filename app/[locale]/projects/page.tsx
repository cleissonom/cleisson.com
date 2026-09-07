import { notFound } from "next/navigation"

import { Lead, PageHeader, SectionStack, Surface } from "@/components/design-system"
import { JsonLd } from "@/components/json-ld"
import { ProjectListWithFilters } from "@/components/project-list-with-filters"
import { getDictionary } from "@/data/i18n"
import { getAllProjects } from "@/lib/content"
import { projectCardImageVariant } from "@/lib/devimg"
import { isLocale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd } from "@/lib/schema"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const dictionary = getDictionary(locale)

  return createMetadata(locale, {
    title: buildPageTitle(dictionary.pages.projects.metadataTitle),
    description: dictionary.pages.projects.metadataDescription,
    path: "/projects",
    imagePath: SEO_IMAGE_PATHS.projects,
    imageAlt: dictionary.pages.projects.metadataTitle
  })
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const ui = dictionary.ui
  const projects = getAllProjects(locale)
  const projectCards = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    role: project.role,
    type: project.type,
    stage: project.stage,
    tags: project.tags,
    cardImage: project.coverImage ? projectCardImageVariant(project.coverImage) : null
  }))

  const breadcrumbs = breadcrumbJsonLd([
    { name: ui.nav.home, url: absoluteUrl(`/${locale}`) },
    { name: ui.nav.projects, url: absoluteUrl(`/${locale}/projects`) }
  ])

  return (
    <SectionStack>
      <JsonLd id="projects-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="section" className="page-overview" aria-labelledby="projects-title">
        <PageHeader className="page-overview-copy">
          <h1 id="projects-title">{dictionary.pages.projects.metadataTitle}</h1>
          <Lead>{dictionary.pages.projects.lead}</Lead>
        </PageHeader>
      </Surface>

      <ProjectListWithFilters
        projects={projectCards}
        locale={locale}
        readMoreLabel={ui.labels.readMore}
        readMoreAboutPrefix={dictionary.snippets.readMoreAboutPrefix}
        detailsUnavailableLabel={dictionary.pages.projects.detailsComingSoonLabel}
        typeLabels={dictionary.pages.projects.typeLabels}
        stageLabels={dictionary.pages.projects.stageLabels}
        copy={{
          filterHeading: dictionary.pages.projects.filterHeading,
          allLabels: dictionary.pages.projects.allLabels,
          clearLabels: dictionary.pages.projects.clearLabels,
          noResultsDescription: dictionary.pages.projects.noResultsDescription,
          resultsCount: dictionary.pages.projects.resultsCount
        }}
      />
    </SectionStack>
  )
}
