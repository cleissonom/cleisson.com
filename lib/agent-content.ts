import "server-only"

import { getDictionary } from "@/data/i18n"
import type { ContentSection, ExperienceCompany } from "@/data/i18n/types"
import {
  getAllPosts,
  getAllProjects,
  getPostBySlug,
  getProjectBySlug,
  type ProjectEntry
} from "@/lib/content"
import { DEFAULT_LOCALE, isLocale, resumePdfPath, type Locale } from "@/lib/i18n"
import { isProjectDetailAvailable } from "@/lib/project-state"
import {
  MCP_ENDPOINT_URL,
  MCP_SERVER_NAME,
  SITE_LINKS,
  SITE_NAME,
  siteEmailAddress
} from "@/lib/site"

export type AgentContent = {
  body: string
  status: 200 | 404
}

function document(...sections: Array<string | null | undefined>): string {
  return `${sections.filter(Boolean).join("\n\n")}\n`
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n")
}

function sectionMarkdown(section: ContentSection): string {
  return document(`## ${section.heading}`, ...section.paragraphs).trim()
}

function homeMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  const projects = getAllProjects(locale).slice(0, 2)
  const posts = getAllPosts(locale).slice(0, 2)

  return document(
    `# ${SITE_NAME}`,
    `> ${dictionary.site.headline}`,
    `## ${dictionary.ui.sections.about}`,
    ...dictionary.content.about,
    `## ${dictionary.ui.sections.focusAreas}\n\n${bulletList(dictionary.content.focusAreas)}`,
    projectIndex(locale, projects),
    postIndex(locale, posts),
    `[${dictionary.ui.cta.contact}](/${locale}/contact)`
  )
}

function aboutMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  const page = dictionary.pages.about

  return document(
    `# ${page.metadataTitle}`,
    `> ${page.lead}`,
    `## ${page.profileHeading}`,
    ...dictionary.content.about,
    `## ${page.focusHeading}\n\n${bulletList(dictionary.content.focusAreas)}`,
    `## ${page.linksHeading}\n\n${bulletList([
      `[${dictionary.ui.nav.experience}](/${locale}/experience)`,
      `[${dictionary.ui.nav.projects}](/${locale}/projects)`,
      `[${dictionary.ui.nav.resume}](/${locale}/resume)`,
      `[LinkedIn](${SITE_LINKS.linkedin})`,
      `[GitHub](${SITE_LINKS.github})`
    ])}`
  )
}

function trustPageMarkdown(locale: Locale, page: "contact" | "privacy"): string {
  const dictionary = getDictionary(locale)
  const content = dictionary.pages[page]
  const contact = page === "contact" ? `[Email](mailto:${siteEmailAddress(locale)})` : null

  return document(
    `# ${content.metadataTitle}`,
    `> ${content.lead}`,
    ...content.sections.map(sectionMarkdown),
    contact
  )
}

function companyMarkdown(company: ExperienceCompany): string {
  const roles = company.roles.map((role) =>
    document(`### ${role.title}`, role.period, bulletList(role.bullets)).trim()
  )

  return document(
    `## ${company.company}`,
    `${company.employment} | ${company.location}`,
    ...roles
  ).trim()
}

function experienceMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  const page = dictionary.pages.experience

  return document(
    `# ${page.metadataTitle}`,
    `> ${page.lead}`,
    ...dictionary.content.experienceTimeline.map(companyMarkdown),
    `## ${page.recommendationsHeading}`,
    page.recommendationsLead,
    ...dictionary.content.recommendations.map((item) =>
      document(`### ${item.name}`, item.context, ...item.quote.map((quote) => `> ${quote}`)).trim()
    )
  )
}

function projectIndex(locale: Locale, projects = getAllProjects(locale)): string {
  const dictionary = getDictionary(locale)
  const entries = projects.map((project) => {
    const title = isProjectDetailAvailable(project)
      ? `[${project.title}](/${locale}/projects/${project.slug})`
      : project.title
    return document(
      `### ${title}`,
      project.summary,
      `**${dictionary.ui.labels.role}:** ${project.role}`,
      `**${dictionary.ui.labels.stack}:** ${project.stack.join(", ")}`
    ).trim()
  })

  return document(`## ${dictionary.ui.sections.projects}`, ...entries).trim()
}

function projectsMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  return document(
    `# ${dictionary.pages.projects.metadataTitle}`,
    `> ${dictionary.pages.projects.lead}`,
    projectIndex(locale)
  )
}

function projectLinks(project: ProjectEntry): string | null {
  const links = Object.entries(project.links).flatMap(([label, url]) =>
    url ? [`[${label}](${url})`] : []
  )
  return links.length > 0 ? `## Links\n\n${bulletList(links)}` : null
}

function projectMarkdown(locale: Locale, slug: string): string | null {
  const dictionary = getDictionary(locale)
  const project = getProjectBySlug(locale, slug)
  if (!project || !isProjectDetailAvailable(project)) return null

  return document(
    `# ${project.title}`,
    `> ${project.summary}`,
    `**${dictionary.ui.labels.role}:** ${project.role}`,
    `**${dictionary.ui.labels.stack}:** ${project.stack.join(", ")}`,
    `**${dictionary.ui.labels.topics}:** ${project.tags.join(", ")}`,
    `## ${dictionary.ui.labels.highlights}\n\n${bulletList(project.highlights)}`,
    project.body,
    projectLinks(project)
  )
}

function postIndex(locale: Locale, posts = getAllPosts(locale)): string {
  const dictionary = getDictionary(locale)
  const entries = posts.map((post) =>
    document(`### [${post.title}](/${locale}/blog/${post.slug})`, post.summary).trim()
  )
  return document(`## ${dictionary.ui.sections.blog}`, ...entries).trim()
}

function blogMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  return document(
    `# ${dictionary.pages.blog.metadataTitle}`,
    `> ${dictionary.pages.blog.lead}`,
    postIndex(locale)
  )
}

function postMarkdown(locale: Locale, slug: string): string | null {
  const dictionary = getDictionary(locale)
  const post = getPostBySlug(locale, slug)
  if (!post) return null

  return document(
    `# ${post.title}`,
    `> ${post.summary}`,
    `**${dictionary.ui.labels.published}:** ${post.date}`,
    post.updatedAt ? `**${dictionary.ui.labels.updated}:** ${post.updatedAt}` : null,
    `**${dictionary.ui.labels.topics}:** ${post.tags.join(", ")}`,
    post.body,
    post.pdfUrl ? `[${dictionary.pages.blog.downloadPdfLabel}](${post.pdfUrl})` : null
  )
}

function resumeMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  return document(
    `# ${dictionary.pages.resume.metadataTitle} — ${SITE_NAME}`,
    `> ${dictionary.pages.resume.summary}`,
    ...dictionary.content.about,
    `## ${dictionary.ui.sections.focusAreas}\n\n${bulletList(dictionary.content.focusAreas)}`,
    `[${dictionary.ui.cta.downloadResume}](${resumePdfPath(locale)})`,
    `[${dictionary.ui.cta.contact}](/${locale}/contact)`
  )
}

function mcpMarkdown(locale: Locale): string {
  const dictionary = getDictionary(locale)
  const page = dictionary.pages.mcp
  const configuration = JSON.stringify(
    { mcpServers: { [MCP_SERVER_NAME]: { url: MCP_ENDPOINT_URL } } },
    null,
    2
  )

  return document(
    `# ${page.metadataTitle}`,
    `> ${page.lead}`,
    `## ${page.endpointHeading}`,
    page.endpointDescription,
    `**Endpoint:** \`${MCP_ENDPOINT_URL}\``,
    `### ${page.configurationLabel}\n\n\`\`\`json\n${configuration}\n\`\`\``,
    `## ${page.toolsHeading}`,
    ...page.tools.map((tool) => `### \`${tool.name}\`\n\n${tool.description}`),
    page.capabilitiesNote,
    `## ${page.examplesHeading}\n\n${bulletList(page.examples)}`,
    `## ${page.boundariesHeading}\n\n${bulletList(page.boundaries)}`,
    `[${page.contactLabel}](/${locale}/contact)`,
    `[${dictionary.pages.privacy.metadataTitle}](/${locale}/privacy)`
  )
}

function notFoundMarkdown(locale: Locale): AgentContent {
  const dictionary = getDictionary(locale)
  return {
    status: 404,
    body: document(
      `# ${dictionary.ui.labels.notFoundTitle}`,
      dictionary.ui.labels.notFoundDescription,
      bulletList([
        `[${dictionary.ui.labels.goHome}](/${locale})`,
        "[Sitemap](/sitemap.xml)",
        "[Agent instructions](/llms.txt)",
        `[${dictionary.ui.nav.projects}](/${locale}/projects)`,
        `[${dictionary.ui.nav.blog}](/${locale}/blog)`
      ])
    )
  }
}

function staticMarkdown(locale: Locale, page?: string): string | null {
  if (!page) return homeMarkdown(locale)
  if (page === "about") return aboutMarkdown(locale)
  if (page === "contact" || page === "privacy") return trustPageMarkdown(locale, page)
  if (page === "experience") return experienceMarkdown(locale)
  if (page === "projects") return projectsMarkdown(locale)
  if (page === "blog") return blogMarkdown(locale)
  if (page === "resume") return resumeMarkdown(locale)
  if (page === "mcp") return mcpMarkdown(locale)
  return null
}

export function getAgentContent(segments: string[]): AgentContent {
  const [localeValue, page, slug, ...rest] = segments
  const locale = isLocale(localeValue) ? localeValue : DEFAULT_LOCALE
  if (!isLocale(localeValue) || rest.length > 0) return notFoundMarkdown(locale)

  const body = slug
    ? page === "projects"
      ? projectMarkdown(locale, slug)
      : page === "blog"
        ? postMarkdown(locale, slug)
        : null
    : staticMarkdown(locale, page)

  return body ? { body, status: 200 } : notFoundMarkdown(locale)
}
