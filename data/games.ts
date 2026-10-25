import "server-only"

import { LOCALES, type Locale } from "@/lib/i18n"

/**
 * Registry of published games. Slugs are shared between locales; localized
 * titles, summaries, and UI copy live in the dictionaries under
 * `pages.games.entries` (see `lib/games.ts`).
 */
export type GameSlug = "falling-blocks" | "sudoku" | "4096"

export const GAMES = ["falling-blocks", "sudoku", "4096"] as const satisfies readonly GameSlug[]

export function isGameSlug(value: string): value is GameSlug {
  return (GAMES as readonly string[]).includes(value)
}

export const GAME_SLUGS_BY_LOCALE: Record<Locale, string[]> = Object.fromEntries(
  LOCALES.map((locale) => [locale, [...GAMES]])
) as Record<Locale, string[]>
