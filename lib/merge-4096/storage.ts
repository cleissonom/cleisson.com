import type { MergeSnapshot } from "./abi"

export type MergeProgress = {
  version: 1
  snapshot: MergeSnapshot
  continued: boolean
}

const PROGRESS_KEY = "4096.progress"
const BEST_KEY = "4096.best-score"
const CELL_COUNT = 16
const MAX_U32 = 0xffff_ffff
const MAX_TILE = 0x8000_0000

function score(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
}

function uint32(value: unknown, allowZero = true): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= (allowZero ? 0 : 1) &&
    value <= MAX_U32
  )
}

function tile(value: unknown): value is number {
  if (typeof value !== "number" || !Number.isInteger(value)) return false
  if (value === 0) return true
  return value >= 2 && value <= MAX_TILE && Number.isInteger(Math.log2(value))
}

function snapshot(value: unknown): value is MergeSnapshot {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<MergeSnapshot>
  return (
    Array.isArray(candidate.cells) &&
    candidate.cells.length === CELL_COUNT &&
    Array.from(candidate.cells).every(tile) &&
    candidate.cells.filter(Boolean).length >= 2 &&
    score(candidate.score) &&
    uint32(candidate.moves) &&
    uint32(candidate.rng, false)
  )
}

function progress(value: unknown): value is MergeProgress {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<MergeProgress>
  return (
    candidate.version === 1 &&
    typeof candidate.continued === "boolean" &&
    snapshot(candidate.snapshot) &&
    (!candidate.continued || candidate.snapshot.cells.some((value) => value >= 4096))
  )
}

function parseBest(value: string | null): number {
  if (value === null || !/^\d+$/.test(value)) return 0
  const parsed = Number(value)
  return score(parsed) ? parsed : 0
}

function serializeProgress(value: MergeProgress): string {
  return JSON.stringify({
    version: 1,
    snapshot: {
      cells: [...value.snapshot.cells],
      score: value.snapshot.score,
      moves: value.snapshot.moves,
      rng: value.snapshot.rng
    },
    continued: value.continued
  })
}

export function load4096Progress(): MergeProgress | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null")
    return progress(value) ? value : null
  } catch {
    return null
  }
}

export function save4096Progress(value: MergeProgress): boolean {
  try {
    if (!progress(value)) return false
    localStorage.getItem(PROGRESS_KEY)
    localStorage.setItem(PROGRESS_KEY, serializeProgress(value))
    return true
  } catch {
    return false
  }
}

export function read4096Best(): number {
  try {
    return parseBest(localStorage.getItem(BEST_KEY))
  } catch {
    return 0
  }
}

export function save4096Best(value: number): number {
  if (!score(value)) return read4096Best()
  try {
    const previous = parseBest(localStorage.getItem(BEST_KEY))
    const best = Math.max(previous, value)
    if (best === previous) return best
    localStorage.setItem(BEST_KEY, String(best))
    return best
  } catch {
    return value
  }
}
