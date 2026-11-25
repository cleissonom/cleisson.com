import type { Locale } from "@/lib/i18n"

export const labsOrganizationUrl = "https://github.com/cleisson-labs"
export const labsInfrastructureUrl = `${labsOrganizationUrl}/.github`

export const labsProjectCopy = {
  "en-US": {
    context: "is where I maintain my open-source tools. The projects share",
    infrastructureLabel: "CI workflows and contributor guides"
  },
  "pt-BR": {
    context: "é onde mantenho minhas ferramentas de código aberto. Os projetos compartilham",
    infrastructureLabel: "workflows de CI e guias de contribuição"
  },
  "es-ES": {
    context: "es donde mantengo mis herramientas de código abierto. Los proyectos comparten",
    infrastructureLabel: "flujos de CI y guías de contribución"
  }
} satisfies Record<Locale, { context: string; infrastructureLabel: string }>
