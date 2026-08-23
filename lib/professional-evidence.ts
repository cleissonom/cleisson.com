import "server-only"

import { getDictionary } from "@/data/i18n"
import type { Recommendation } from "@/data/i18n/types"
import {
  getAllPosts,
  getAllProjects,
  getProjectBySlug,
  type BlogEntry,
  type ProjectEntry
} from "@/lib/content"
import type { Locale } from "@/lib/i18n"
import { isProjectDetailAvailable } from "@/lib/project-state"
import { SITE_IDENTITY_LINKS, SITE_NAME, SITE_URL } from "@/lib/site"

export type EvidenceType =
  | "self_reported_profile"
  | "self_reported_experience"
  | "self_reported_project"
  | "inspectable_public_artifact"
  | "published_writing"
  | "republished_testimonial"

export type MatchStatus = "direct" | "adjacent" | "no_public_evidence"

export type EvidenceItem = {
  evidenceType: EvidenceType
  matchStatus: Exclude<MatchStatus, "no_public_evidence">
  claim: string
  context: string
  sourceUrl: string
  sourceMarkdownUrl: string
  artifactUrls: string[]
}

export type TopicEvidence = {
  topic: string
  status: MatchStatus
  totalMatches: number
  evidence: EvidenceItem[]
}

type SearchRecord = Omit<EvidenceItem, "matchStatus"> & {
  id: string
  searchText: string
}

const evidencePriority: Record<EvidenceType, number> = {
  inspectable_public_artifact: 0,
  self_reported_experience: 1,
  published_writing: 2,
  self_reported_project: 3,
  self_reported_profile: 4,
  republished_testimonial: 5
}

const disclaimers: Record<Locale, string> = {
  "en-US":
    "Results cover this candidate-authored public portfolio only. No public evidence is not evidence of no experience; verify material claims directly in an interview.",
  "pt-BR":
    "Os resultados cobrem apenas este portfólio público mantido pelo candidato. Nenhuma evidência pública não significa ausência de experiência; valide informações relevantes diretamente em uma entrevista.",
  "es-ES":
    "Los resultados cubren únicamente este portafolio público mantenido por el candidato. Sin evidencia pública no significa falta de experiencia; valida las afirmaciones relevantes directamente en una entrevista."
}

const unavailableProjectMessages: Record<Locale, string> = {
  "en-US": "This project's detail page is not publicly available. Use the public project index.",
  "pt-BR":
    "A página de detalhes deste projeto não está disponível publicamente. Use o índice público de projetos.",
  "es-ES":
    "La página de detalles de este proyecto no está disponible públicamente. Usa el índice público de proyectos."
}

const missingProjectMessages: Record<Locale, string> = {
  "en-US": "No public project matched this slug.",
  "pt-BR": "Nenhum projeto público corresponde a este slug.",
  "es-ES": "Ningún proyecto público coincide con este slug."
}

const artifactLabels: Record<Locale, string> = {
  "en-US": "Inspectable public artifacts",
  "pt-BR": "Artefatos públicos verificáveis",
  "es-ES": "Artefactos públicos inspeccionables"
}

const aliasGroups = [
  ["nodejs", "node.js", "node js"],
  ["nextjs", "next.js", "next js"],
  ["postgres", "postgresql"],
  ["k8s", "kubernetes"],
  ["cicd", "ci-cd", "ci/cd", "ci cd"],
  ["mcp", "model context protocol"],
  ["aws", "amazon web services"],
  ["iac", "infrastructure as code"],
  ["llm", "llms", "large language model", "large language models"]
] as const

function sourceUrls(locale: Locale, path: string) {
  const sourceUrl = `${SITE_URL}/${locale}${path}`
  return { sourceUrl, sourceMarkdownUrl: `${sourceUrl}.md` }
}

function normalizePhrase(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
}

const normalizedAliasGroups = aliasGroups.map((group) => group.map(normalizePhrase))

function topicPhrases(topic: string): string[] {
  const normalized = normalizePhrase(topic)
  return normalizedAliasGroups.find((group) => group.includes(normalized)) ?? [normalized]
}

function directPhraseMatch(searchText: string, phrases: string[]): boolean {
  const paddedSearch = ` ${searchText} `
  return phrases.some((phrase) => paddedSearch.includes(` ${phrase} `))
}

function matchRecord(
  record: SearchRecord,
  topic: string
): Exclude<MatchStatus, "no_public_evidence"> | null {
  const phrases = topicPhrases(topic)
  if (directPhraseMatch(record.searchText, phrases)) return "direct"

  const tokens = normalizePhrase(topic).split(" ").filter(Boolean)
  const recordTokens = new Set(record.searchText.split(" "))
  return tokens.length > 1 && tokens.every((token) => recordTokens.has(token)) ? "adjacent" : null
}

function record(
  id: string,
  item: Omit<SearchRecord, "id" | "searchText">,
  searchable: string
): SearchRecord {
  return { id, ...item, searchText: normalizePhrase(searchable) }
}

function profileRecords(locale: Locale): SearchRecord[] {
  const dictionary = getDictionary(locale)
  const urls = sourceUrls(locale, "/about")
  const about = dictionary.content.about.map((claim, index) =>
    record(
      `profile:about:${index}`,
      {
        ...urls,
        evidenceType: "self_reported_profile",
        claim,
        context: dictionary.pages.about.profileHeading,
        artifactUrls: []
      },
      claim
    )
  )
  const focus = dictionary.content.focusAreas.map((area, index) =>
    record(
      `profile:focus:${index}`,
      {
        ...urls,
        evidenceType: "self_reported_profile",
        claim: area,
        context: dictionary.pages.about.focusHeading,
        artifactUrls: []
      },
      area
    )
  )
  return [...about, ...focus]
}

function experienceRecords(locale: Locale): SearchRecord[] {
  const urls = sourceUrls(locale, "/experience")
  return getDictionary(locale).content.experienceTimeline.flatMap((company, companyIndex) =>
    company.roles.flatMap((role, roleIndex) =>
      role.bullets.map((claim, bulletIndex) =>
        record(
          `experience:${companyIndex}:${roleIndex}:${bulletIndex}`,
          {
            ...urls,
            evidenceType: "self_reported_experience",
            claim,
            context: `${company.company} — ${role.title} — ${role.period}`,
            artifactUrls: []
          },
          `${claim} ${company.company} ${role.title}`
        )
      )
    )
  )
}

function recommendationRecord(
  recommendation: Recommendation,
  quote: string,
  index: number,
  locale: Locale
): SearchRecord {
  return record(
    `recommendation:${recommendation.id}:${index}`,
    {
      ...sourceUrls(locale, "/experience"),
      evidenceType: "republished_testimonial",
      claim: quote,
      context: `${recommendation.name} — ${recommendation.context}`,
      artifactUrls: []
    },
    `${quote} ${recommendation.name} ${recommendation.context}`
  )
}

function recommendationRecords(locale: Locale): SearchRecord[] {
  return getDictionary(locale).content.recommendations.flatMap((recommendation) =>
    recommendation.quote.map((quote, index) =>
      recommendationRecord(recommendation, quote, index, locale)
    )
  )
}

function artifactUrls(project: ProjectEntry): string[] {
  return Object.values(project.links).filter((url): url is string => Boolean(url))
}

function projectRecord(
  project: ProjectEntry,
  suffix: string,
  claim: string,
  locale: Locale
): SearchRecord {
  const available = isProjectDetailAvailable(project)
  const artifacts = available ? artifactUrls(project) : []
  const path = available ? `/projects/${project.slug}` : "/projects"
  return record(
    `project:${project.slug}:${suffix}`,
    {
      ...sourceUrls(locale, path),
      evidenceType: "self_reported_project",
      claim,
      context: `${project.title} — ${project.role}`,
      artifactUrls: artifacts
    },
    `${claim} ${project.title} ${project.role}`
  )
}

function projectArtifactRecord(project: ProjectEntry, locale: Locale): SearchRecord | null {
  const artifacts = artifactUrls(project)
  if (!isProjectDetailAvailable(project) || !artifacts.length) return null
  const claim = `${artifactLabels[locale]}: ${project.title}`
  return record(
    `project:${project.slug}:artifacts`,
    {
      ...sourceUrls(locale, `/projects/${project.slug}`),
      evidenceType: "inspectable_public_artifact",
      claim,
      context: `${project.title} — ${project.role}`,
      artifactUrls: artifacts
    },
    project.title
  )
}

function projectRecords(locale: Locale): SearchRecord[] {
  return getAllProjects(locale).flatMap((project) => {
    const visible: SearchRecord[] = [
      projectRecord(project, "summary", project.summary, locale),
      projectRecord(project, "stack", `Stack: ${project.stack.join(", ")}`, locale),
      projectRecord(project, "topics", `Topics: ${project.tags.join(", ")}`, locale)
    ]
    if (!isProjectDetailAvailable(project)) return visible
    const artifact = projectArtifactRecord(project, locale)
    return [
      ...(artifact ? [artifact] : []),
      ...visible,
      ...project.highlights.map((claim, index) =>
        projectRecord(project, `highlight:${index}`, claim, locale)
      )
    ]
  })
}

function postArtifacts(post: BlogEntry): string[] {
  const urls = [post.canonicalUrl]
  if (post.pdfUrl) urls.push(`${SITE_URL}${post.pdfUrl}`)
  return urls.filter((url): url is string => Boolean(url))
}

function postRecord(post: BlogEntry, suffix: string, claim: string, locale: Locale): SearchRecord {
  return record(
    `post:${post.slug}:${suffix}`,
    {
      ...sourceUrls(locale, `/blog/${post.slug}`),
      evidenceType: "published_writing",
      claim,
      context: `${post.title} — ${post.updatedAt ?? post.date}`,
      artifactUrls: postArtifacts(post)
    },
    `${claim} ${post.title}`
  )
}

function postRecords(locale: Locale): SearchRecord[] {
  return getAllPosts(locale).flatMap((post) => [
    postRecord(post, "summary", post.summary, locale),
    postRecord(post, "topics", `Topics: ${post.tags.join(", ")}`, locale)
  ])
}

function allRecords(locale: Locale): SearchRecord[] {
  return [
    ...profileRecords(locale),
    ...experienceRecords(locale),
    ...projectRecords(locale),
    ...postRecords(locale),
    ...recommendationRecords(locale)
  ]
}

function evidenceItem(
  record: SearchRecord,
  matchStatus: EvidenceItem["matchStatus"]
): EvidenceItem {
  const { id: _id, searchText: _searchText, ...item } = record
  return { ...item, matchStatus }
}

function topicEvidence(records: SearchRecord[], topic: string, limit: number): TopicEvidence {
  const matches = records
    .map((item) => ({ item, matchStatus: matchRecord(item, topic) }))
    .filter((match): match is { item: SearchRecord; matchStatus: EvidenceItem["matchStatus"] } =>
      Boolean(match.matchStatus)
    )
    .sort((left, right) => {
      const statusOrder =
        left.matchStatus === right.matchStatus ? 0 : left.matchStatus === "direct" ? -1 : 1
      return (
        statusOrder ||
        evidencePriority[left.item.evidenceType] - evidencePriority[right.item.evidenceType] ||
        left.item.id.localeCompare(right.item.id)
      )
    })

  if (!matches.length) return { topic, status: "no_public_evidence", totalMatches: 0, evidence: [] }
  return {
    topic,
    status: matches[0].matchStatus,
    totalMatches: matches.length,
    evidence: matches
      .slice(0, limit)
      .map(({ item, matchStatus }) => evidenceItem(item, matchStatus))
  }
}

function uniqueTopics(topics: string[]): string[] {
  const seen = new Set<string>()
  return topics.flatMap((topic) => {
    const trimmed = topic.trim()
    const key = normalizePhrase(trimmed)
    if (!key || seen.has(key)) return []
    seen.add(key)
    return [trimmed]
  })
}

export function findProfessionalEvidence(topics: string[], locale: Locale, limitPerTopic = 5) {
  const records = allRecords(locale)
  return {
    locale,
    disclaimer: disclaimers[locale],
    topics: uniqueTopics(topics).map((topic) => topicEvidence(records, topic, limitPerTopic))
  }
}

export function getProfessionalProfile(locale: Locale) {
  const dictionary = getDictionary(locale)
  const company = dictionary.content.experienceTimeline[0]
  const role = company?.roles[0]
  return {
    locale,
    name: SITE_NAME,
    headline: dictionary.site.headline,
    about: dictionary.content.about,
    focusAreas: dictionary.content.focusAreas,
    currentRole:
      company && role
        ? {
            company: company.company,
            title: role.title,
            period: role.period,
            location: company.location,
            ...sourceUrls(locale, "/experience")
          }
        : null,
    verifiedLinks: [...SITE_IDENTITY_LINKS],
    contactUrl: `${SITE_URL}/${locale}/contact`,
    ...sourceUrls(locale, "/about")
  }
}

export function getPublicProject(locale: Locale, slug: string) {
  const project = getProjectBySlug(locale, slug)
  const indexUrls = sourceUrls(locale, "/projects")
  if (!project)
    return {
      locale,
      found: false,
      message: missingProjectMessages[locale],
      project: null,
      ...indexUrls
    }
  if (!isProjectDetailAvailable(project)) {
    return {
      locale,
      found: false,
      message: unavailableProjectMessages[locale],
      project: null,
      ...indexUrls
    }
  }

  const urls = sourceUrls(locale, `/projects/${project.slug}`)
  return {
    locale,
    found: true,
    message: null,
    project: {
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      role: project.role,
      status: project.status,
      type: project.type,
      stage: project.stage,
      tags: project.tags,
      stack: project.stack,
      highlights: project.highlights,
      artifactUrls: artifactUrls(project),
      ...urls
    },
    ...urls
  }
}
