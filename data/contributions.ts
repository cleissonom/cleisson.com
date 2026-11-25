import type { Locale } from "@/lib/i18n"

type ContributionId = "aws-cookie-expiry" | "netflix-hardware-filters" | "django-template-blocks"

export type Contribution = {
  id: ContributionId
  organization: string
  project: string
  repository: string
  number: number
  mergedAt: string
  status: "merged"
  url: string
  title: string
  summary: string
}

type ContributionRecord = Omit<Contribution, "url" | "status" | "title" | "summary"> & {
  translations: Record<Locale, Pick<Contribution, "title" | "summary">>
}

const records: ContributionRecord[] = [
  {
    id: "aws-cookie-expiry",
    organization: "Amazon Web Services",
    project: "Powertools for AWS Lambda (Python)",
    repository: "aws-powertools/powertools-lambda-python",
    number: 8876,
    mergedAt: "2026-11-25T13:07:17Z",
    translations: {
      "en-US": {
        title: "Keep cookie expiry times correct across time zones",
        summary:
          "The event handler now converts expiry times to GMT before sending a cookie. It also uses English weekday and month names, as HTTP requires, regardless of the server’s locale."
      },
      "pt-BR": {
        title: "Corrigir a expiração de cookies entre fusos horários",
        summary:
          "O manipulador de eventos agora converte o horário de expiração para GMT antes de enviar o cookie. Os nomes dos dias e meses saem em inglês, como exige o HTTP, independentemente do idioma do servidor."
      },
      "es-ES": {
        title: "Corregir la caducidad de las cookies entre husos horarios",
        summary:
          "El gestor de eventos convierte la fecha de caducidad a GMT antes de enviar la cookie. Los nombres de los días y los meses se escriben en inglés, como exige HTTP, independientemente del idioma del servidor."
      }
    }
  },
  {
    id: "netflix-hardware-filters",
    organization: "Netflix Skunkworks",
    project: "Service Capacity Modeling",
    repository: "Netflix-Skunkworks/service-capacity-modeling",
    number: 373,
    mergedAt: "2026-11-24T05:20:39Z",
    translations: {
      "en-US": {
        title: "Apply hardware filters to mean and percentile plans",
        summary:
          "The capacity planner could recommend disks or instances outside the requested hardware pool. Its mean and percentile estimates now respect the same drive and lifecycle filters as the least-regret plan."
      },
      "pt-BR": {
        title: "Respeitar os filtros de hardware nas médias e nos percentis",
        summary:
          "O planejador de capacidade podia recomendar discos ou instâncias fora do conjunto solicitado. As estimativas de média e percentis agora usam os mesmos filtros de disco e de ciclo de vida do plano de menor arrependimento."
      },
      "es-ES": {
        title: "Aplicar los filtros de hardware a las medias y los percentiles",
        summary:
          "El planificador de capacidad podía recomendar discos o instancias fuera del conjunto solicitado. Las estimaciones de medias y percentiles ahora respetan los mismos filtros de disco y de ciclo de vida que el plan de mínimo arrepentimiento."
      }
    }
  },
  {
    id: "django-template-blocks",
    organization: "Django Software Foundation",
    project: "Django",
    repository: "django/django",
    number: 22322,
    mergedAt: "2026-11-23T14:43:19Z",
    translations: {
      "en-US": {
        title: "Match the right closing tag in Django templates",
        summary:
          "Fixed how the template parser closes comment and verbatim blocks. With multiline tags disabled, a closing tag split across lines can no longer end the block prematurely."
      },
      "pt-BR": {
        title: "Reconhecer a tag de fechamento correta nos templates do Django",
        summary:
          "Corrigi a leitura dos blocos comment e verbatim. Quando as tags de várias linhas estão desativadas, uma tag de fechamento dividida em duas linhas já não encerra o bloco antes da hora."
      },
      "es-ES": {
        title: "Reconocer la etiqueta de cierre correcta en las plantillas de Django",
        summary:
          "Corregí la lectura de los bloques comment y verbatim. Cuando las etiquetas multilínea están desactivadas, una etiqueta de cierre dividida en dos líneas ya no termina el bloque antes de tiempo."
      }
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
  return records.map(({ translations, ...record }) => ({
    ...record,
    ...translations[locale],
    status: "merged",
    url: `https://github.com/${record.repository}/pull/${record.number}`
  }))
}

export function getContributionsCopy(locale: Locale) {
  return copy[locale]
}
