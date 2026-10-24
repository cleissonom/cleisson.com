import { GAMES, isGameSlug, type GameSlug } from "@/data/games"
import { getDictionary } from "@/data/i18n"
import type { GamePageDictionary } from "@/data/i18n/types"
import type { Locale } from "@/lib/i18n"

export type GameEntry = {
  slug: GameSlug
  title: string
  summary: string
  description: string
  stack: string[]
  wasmPath: string
}

export type GamesPageDictionary = GamePageDictionary

export const FALLING_BLOCKS_WASM_PATH = "/games/falling-blocks/falling-blocks.wasm"
export const SUDOKU_WASM_PATH = "/games/sudoku/sudoku.wasm"

export function gamesDictionary(locale: Locale): GamesPageDictionary {
  return getDictionary(locale).pages.games
}

export function getAllGames(locale: Locale): GameEntry[] {
  const entries = gamesDictionary(locale).entries
  return GAMES.map((slug) => ({
    slug,
    wasmPath: slug === "sudoku" ? SUDOKU_WASM_PATH : FALLING_BLOCKS_WASM_PATH,
    ...entries[slug]
  }))
}

export function getGameBySlug(locale: Locale, slug: string): GameEntry | null {
  if (!isGameSlug(slug)) return null
  return getAllGames(locale).find((game) => game.slug === slug) ?? null
}
