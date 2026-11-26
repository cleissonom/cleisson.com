import type { Locale } from "@/lib/i18n"

type Organization = "Amazon Web Services" | "Netflix Skunkworks" | "Django Software Foundation"

export type Contribution = {
  id: string
  organization: Organization
  project: string
  repository: string
  number: number
  mergedAt: string
  status: "merged"
  url: string
  title: string
}

type ContributionRecord = Omit<Contribution, "url" | "status" | "title"> & {
  titles: Record<Locale, string>
}

// Newest first. Keep each entry to a short title; the pull request has the details.
const records: ContributionRecord[] = [
  {
    id: "django-deferred-foreign-keys",
    organization: "Django Software Foundation",
    project: "Django",
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
    id: "aws-cookie-expiry",
    organization: "Amazon Web Services",
    project: "Powertools for AWS Lambda (Python)",
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
    id: "netflix-hardware-filters",
    organization: "Netflix Skunkworks",
    project: "Service Capacity Modeling",
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
    id: "django-template-blocks",
    organization: "Django Software Foundation",
    project: "Django",
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
    pullRequestLabel: "Pull request"
  },
  "pt-BR": {
    title: "Contribuições de código aberto",
    lead: "Correções que enviei a projetos de código aberto. Os pull requests mostram o que mudou e os testes que cobrem cada correção.",
    mergedLabel: "Integrado em",
    pullRequestLabel: "Pull request"
  },
  "es-ES": {
    title: "Contribuciones al código abierto",
    lead: "Correcciones que he aportado a proyectos de código abierto. Los pull requests muestran los cambios y las pruebas que cubren cada corrección.",
    mergedLabel: "Integrado el",
    pullRequestLabel: "Pull request"
  }
} satisfies Record<
  Locale,
  { title: string; lead: string; mergedLabel: string; pullRequestLabel: string }
>

export function getContributions(locale: Locale): Contribution[] {
  return records.map(({ titles, ...record }) => ({
    ...record,
    title: titles[locale],
    status: "merged",
    url: `https://github.com/${record.repository}/pull/${record.number}`
  }))
}

export function getContributionsCopy(locale: Locale) {
  return copy[locale]
}
