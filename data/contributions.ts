import type { Locale } from "@/lib/i18n"

type Organization = "Amazon Web Services" | "Netflix Skunkworks" | "Django Software Foundation"

type RepositoryDetails = {
  project: string
  organization: Organization
  stars: number
}

// GitHub stargazer counts read on this date. Refresh both when adding a contribution.
export const STARS_CHECKED_AT = "2026-11-26"

const repositories = {
  "django/django": {
    project: "Django",
    organization: "Django Software Foundation",
    stars: 91916
  },
  "aws-powertools/powertools-lambda-python": {
    project: "Powertools for AWS Lambda (Python)",
    organization: "Amazon Web Services",
    stars: 3306
  },
  "Netflix-Skunkworks/service-capacity-modeling": {
    project: "Service Capacity Modeling",
    organization: "Netflix Skunkworks",
    stars: 96
  }
} satisfies Record<string, RepositoryDetails>

type Repository = keyof typeof repositories

export type Contribution = {
  id: string
  repository: Repository
  project: string
  organization: Organization
  number: number
  mergedAt: string
  status: "merged"
  url: string
  title: string
}

export type ContributionGroup = RepositoryDetails & {
  repository: Repository
  url: string
  contributions: Contribution[]
}

type ContributionRecord = Pick<Contribution, "repository" | "number" | "mergedAt"> & {
  titles: Record<Locale, string>
}

// Newest first. Keep each entry to a short title; the pull request has the details.
const records: ContributionRecord[] = [
  {
    repository: "django/django",
    number: 22332,
    mergedAt: "2026-11-26T14:11:53Z",
    titles: {
      "en-US": "Preserve the order of sliced querysets in model formsets",
      "pt-BR": "Preservar a ordem de querysets fatiados nos formsets de modelo",
      "es-ES": "Conservar el orden de los querysets rebanados en los formsets de modelo"
    }
  },
  {
    repository: "django/django",
    number: 22333,
    mergedAt: "2026-11-26T10:41:24Z",
    titles: {
      "en-US": "Keep deferred foreign keys from breaking the admin changelist",
      "pt-BR": "Evitar que chaves estrangeiras adiadas quebrem a listagem do admin",
      "es-ES": "Evitar que las claves foráneas diferidas rompan el listado del admin"
    }
  },
  {
    repository: "aws-powertools/powertools-lambda-python",
    number: 8876,
    mergedAt: "2026-11-25T13:07:17Z",
    titles: {
      "en-US": "Keep cookie expiry times correct across time zones",
      "pt-BR": "Corrigir a expiração de cookies entre fusos horários",
      "es-ES": "Corregir la caducidad de las cookies entre husos horarios"
    }
  },
  {
    repository: "Netflix-Skunkworks/service-capacity-modeling",
    number: 373,
    mergedAt: "2026-11-24T05:20:39Z",
    titles: {
      "en-US": "Apply hardware filters to mean and percentile plans",
      "pt-BR": "Respeitar os filtros de hardware nas médias e nos percentis",
      "es-ES": "Aplicar los filtros de hardware a las medias y los percentiles"
    }
  },
  {
    repository: "django/django",
    number: 22322,
    mergedAt: "2026-11-23T14:43:19Z",
    titles: {
      "en-US": "Match the right closing tag in Django templates",
      "pt-BR": "Reconhecer a tag de fechamento correta nos templates do Django",
      "es-ES": "Reconocer la etiqueta de cierre correcta en las plantillas de Django"
    }
  }
]

const copy = {
  "en-US": {
    title: "Open-source contributions",
    lead: "Fixes I’ve contributed to open-source projects. The pull requests link to the patches and the tests that cover them.",
    mergedLabel: "Merged",
    pullRequestLabel: "Pull request",
    pullRequestCount: { one: "merged pull request", other: "merged pull requests" },
    starsLabel: "GitHub stars",
    starsCheckedLabel: "Star counts as of"
  },
  "pt-BR": {
    title: "Contribuições de código aberto",
    lead: "Correções que enviei a projetos de código aberto. Os pull requests mostram o que mudou e os testes que cobrem cada correção.",
    mergedLabel: "Integrado em",
    pullRequestLabel: "Pull request",
    pullRequestCount: { one: "pull request integrado", other: "pull requests integrados" },
    starsLabel: "estrelas no GitHub",
    starsCheckedLabel: "Estrelas contadas em"
  },
  "es-ES": {
    title: "Contribuciones al código abierto",
    lead: "Correcciones que he aportado a proyectos de código abierto. Los pull requests muestran los cambios y las pruebas que cubren cada corrección.",
    mergedLabel: "Integrado el",
    pullRequestLabel: "Pull request",
    pullRequestCount: { one: "pull request integrado", other: "pull requests integrados" },
    starsLabel: "estrellas en GitHub",
    starsCheckedLabel: "Estrellas contadas el"
  }
} satisfies Record<
  Locale,
  {
    title: string
    lead: string
    mergedLabel: string
    pullRequestLabel: string
    pullRequestCount: { one: string; other: string }
    starsLabel: string
    starsCheckedLabel: string
  }
>

export function getContributions(locale: Locale): Contribution[] {
  return records.map(({ titles, ...record }) => ({
    ...record,
    id: `${record.repository}#${record.number}`,
    project: repositories[record.repository].project,
    organization: repositories[record.repository].organization,
    title: titles[locale],
    status: "merged",
    url: `https://github.com/${record.repository}/pull/${record.number}`
  }))
}

// Groups follow their newest contribution, because the records are newest first.
export function getContributionGroups(locale: Locale): ContributionGroup[] {
  const groups = new Map<Repository, ContributionGroup>()
  for (const contribution of getContributions(locale)) {
    const { repository } = contribution
    const group = groups.get(repository) ?? {
      ...repositories[repository],
      repository,
      url: `https://github.com/${repository}`,
      contributions: []
    }
    group.contributions.push(contribution)
    groups.set(repository, group)
  }
  return [...groups.values()]
}

export function formatPullRequestCount(count: number, locale: Locale): string {
  const { one, other } = copy[locale].pullRequestCount
  return `${count} ${new Intl.PluralRules(locale).select(count) === "one" ? one : other}`
}

export function formatStars(stars: number, locale: Locale): string {
  const count = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 })
  return `${count.format(stars)} ${copy[locale].starsLabel}`
}

export function getContributionsCopy(locale: Locale) {
  return copy[locale]
}
