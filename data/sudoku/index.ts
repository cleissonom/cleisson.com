import type { Locale } from "@/lib/i18n"

import { sudokuEnUS } from "./en-US"
import { sudokuEsES } from "./es-ES"
import { sudokuPtBR } from "./pt-BR"
import type { SudokuDictionary } from "./types"

const dictionaries: Record<Locale, SudokuDictionary> = {
  "en-US": sudokuEnUS,
  "pt-BR": sudokuPtBR,
  "es-ES": sudokuEsES
}

export function getSudokuDictionary(locale: Locale): SudokuDictionary {
  return dictionaries[locale]
}
