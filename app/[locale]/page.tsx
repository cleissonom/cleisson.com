import { notFound } from "next/navigation"
import Image from "next/image"

import { OrbitalPortrait } from "@/components/astronomy"
import {
  ButtonLink,
  Chip,
  ChipRow,
  Grid,
  InlineLink,
  Lead,
  PageHeader,
  SectionStack,
  Surface
} from "@/components/design-system"
import { ExperienceTimeline } from "@/components/experience-timeline"
import { JsonLd } from "@/components/json-ld"
import { LinkedInButton } from "@/components/linkedin-button"
import { PostCard } from "@/components/post-card"
import { ProjectCard } from "@/components/project-card"
import { getDictionary } from "@/data/i18n"
import { siteIdentity } from "@/data/profile"
import { getAllPosts, getAllProjects } from "@/lib/content"
import { summarizeExperienceTimeline } from "@/lib/experience"
import { isLocale } from "@/lib/i18n"
import { SEO_IMAGE_PATHS, absoluteUrl, buildPageTitle, createMetadata } from "@/lib/metadata"
import { breadcrumbJsonLd, personJsonLd } from "@/lib/schema"
import { siteEmailHref } from "@/lib/site"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const dictionary = getDictionary(locale)

  return createMetadata(locale, {
    title: buildPageTitle(siteIdentity.name),
    description: dictionary.site.headline,
    path: "/",
    imagePath: SEO_IMAGE_PATHS.home,
    imageAlt: siteIdentity.name,
    keywords: [...dictionary.pages.home.keywords]
  })
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const dictionary = getDictionary(locale)
  const ui = dictionary.ui
  const about = dictionary.content.about
  const experienceTimeline = summarizeExperienceTimeline(dictionary.content.experienceTimeline)
  const fullExperienceTimeline = dictionary.content.experienceTimeline
  const focusAreas = dictionary.content.focusAreas
  const allProjects = getAllProjects(locale)
  const allPosts = getAllPosts(locale)
  const projects = allProjects.slice(0, 2)
  const posts = allPosts.slice(0, 2)
  const currentCompany = fullExperienceTimeline[0]
  const currentRole = currentCompany?.roles[0]
  const bestFitSummary = dictionary.pages.contact.sections[0]?.paragraphs[0]

  const breadcrumbs = breadcrumbJsonLd([
    { name: dictionary.pages.home.breadcrumbLabel, url: absoluteUrl(`/${locale}`) }
  ])

  return (
    <>
      <JsonLd id="person-jsonld" data={personJsonLd(locale, about[0])} />
      <JsonLd id="home-breadcrumb-jsonld" data={breadcrumbs} />

      <Surface as="div" className="hero">
        <div className="hero-layout">
          <div className="hero-copy">
            <h1>{siteIdentity.name}</h1>
            <Lead>{about[0]}</Lead>
            <div className="hero-actions">
              <ButtonLink href={siteEmailHref(locale)}>{ui.cta.emailMe}</ButtonLink>
              <ButtonLink variant="secondary" href={`/${locale}/experience`}>
                {ui.cta.viewExperience}
              </ButtonLink>
              <LinkedInButton
                label={ui.cta.linkedin}
                opensInNewTabLabel={ui.labels.opensInNewTab}
              />
            </div>
          </div>

          <OrbitalPortrait>
            <figure className="hero-portrait">
              <Image
                src="/about/profile.webp"
                alt={siteIdentity.name}
                width={448}
                height={459}
                sizes="(min-width: 768px) 208px, 144px"
                loading="eager"
              />
            </figure>
          </OrbitalPortrait>
        </div>
      </Surface>

      <SectionStack as="div">
        <SectionStack
          as="section"
          className="preview-section"
          aria-labelledby="home-projects-title"
        >
          <PageHeader as="div" className="section-heading-row">
            <h2 id="home-projects-title">{ui.sections.projects}</h2>
            <InlineLink href={`/${locale}/projects`}>{ui.nav.projects}</InlineLink>
          </PageHeader>
          <Grid>
            {projects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                cardImage={null}
                locale={locale}
                readMoreLabel={ui.labels.readMore}
                readMoreAboutPrefix={dictionary.snippets.readMoreAboutPrefix}
                detailsUnavailableLabel={dictionary.pages.projects.detailsComingSoonLabel}
                typeLabel={dictionary.pages.projects.typeLabels[project.type]}
                stageLabel={dictionary.pages.projects.stageLabels[project.stage]}
              />
            ))}
          </Grid>
        </SectionStack>

        <Surface as="section" className="preview-section" aria-labelledby="home-experience-title">
          <div className="section-heading-row">
            <div>
              <h2 id="home-experience-title">{ui.sections.experience}</h2>
              {currentCompany && currentRole ? (
                <p className="muted">
                  {currentRole.title} | {currentCompany.company}
                </p>
              ) : null}
            </div>
            <InlineLink href={`/${locale}/experience`}>{ui.nav.experience}</InlineLink>
          </div>
          <ExperienceTimeline
            items={experienceTimeline}
            ariaLabel={ui.labels.experienceTimelineAria}
          />
        </Surface>

        <SectionStack as="section" className="preview-section" aria-labelledby="home-blog-title">
          <PageHeader as="div" className="section-heading-row">
            <h2 id="home-blog-title">{ui.sections.blog}</h2>
            <InlineLink href={`/${locale}/blog`}>{ui.nav.blog}</InlineLink>
          </PageHeader>
          <Grid className="writing-grid">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                locale={locale}
                readMoreLabel={ui.labels.readMore}
                readMoreAboutPrefix={dictionary.snippets.readMoreAboutPrefix}
                readingMinutesLabel={dictionary.snippets.readingMinutesShort}
              />
            ))}
          </Grid>
        </SectionStack>
        <Surface as="section" className="home-snapshot" aria-labelledby="home-snapshot-title">
          <div className="section-heading-row">
            <h2 id="home-snapshot-title">{ui.sections.about}</h2>
            <InlineLink href={`/${locale}/about`}>{ui.sections.about}</InlineLink>
          </div>
          <div className="snapshot-copy">
            {about.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>{dictionary.site.headline}</p>
            {bestFitSummary ? <p>{bestFitSummary}</p> : null}
            <p>
              <InlineLink href={`/${locale}/mcp`}>
                {dictionary.pages.mcp.documentationLabel}
              </InlineLink>
            </p>
          </div>
        </Surface>
        <Surface as="section" className="home-focus" aria-labelledby="home-focus-title">
          <h2 id="home-focus-title">{ui.sections.focusAreas}</h2>
          <ChipRow>
            {focusAreas.map((area) => (
              <Chip key={area}>{area}</Chip>
            ))}
          </ChipRow>
        </Surface>
      </SectionStack>
    </>
  )
}
