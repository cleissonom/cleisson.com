import type { Locale } from "@/lib/i18n"

import { merge4096EnUS } from "./en-US"
import { merge4096EsES } from "./es-ES"
import { merge4096PtBR } from "./pt-BR"
import type { Merge4096Dictionary } from "./types"

const dictionaries: Record<Locale, Merge4096Dictionary> = {
  "en-US": merge4096EnUS,
  "pt-BR": merge4096PtBR,
  "es-ES": merge4096EsES
}

export function get4096Dictionary(locale: Locale): Merge4096Dictionary {
  return dictionaries[locale]
}
