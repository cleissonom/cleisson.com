import type { Difficulty } from "./abi"

export type SudokuProgress = {
  version: 1
  difficulty: Difficulty
  givens: number[]
  values: number[]
  notes: number[]
  elapsedMs: number
  hintsUsed: number
}
export type SudokuRecords = Partial<Record<Difficulty, number>>
const PROGRESS_KEY = "sudoku.progress"
const RECORDS_KEY = "sudoku.best-times"

function integer(value: unknown, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= maximum
}

function cells(value: unknown, maximum: number): value is number[] {
  return (
    Array.isArray(value) && value.length === 81 && value.every((cell) => integer(cell, maximum))
  )
}

function validProgress(value: unknown): value is SudokuProgress {
  if (!value || typeof value !== "object") return false
  const save = value as Partial<SudokuProgress>
  if (
    save.version !== 1 ||
    !integer(save.difficulty, 2) ||
    !cells(save.givens, 9) ||
    !cells(save.values, 9) ||
    !cells(save.notes, 511) ||
    !integer(save.elapsedMs) ||
    !integer(save.hintsUsed)
  )
    return false
  const { givens, values, notes } = save
  return (
    givens.filter(Boolean).length >= 24 &&
    givens.every(
      (given, index) =>
        (!given || values[index] === given) && (!values[index] || notes[index] === 0)
    )
  )
}

export function loadSudokuProgress(): SudokuProgress | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "null")
    return validProgress(value) ? value : null
  } catch {
    return null
  }
}

export function saveSudokuProgress(progress: SudokuProgress): boolean {
  if (!validProgress(progress)) return false
  try {
    // Preserve a previous puzzle if the browser currently prevents reading it.
    localStorage.getItem(PROGRESS_KEY)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
    return true
  } catch {
    return false
  }
}

function parseRecords(raw: string | null): SudokuRecords {
  let value: unknown
  try {
    value = JSON.parse(raw ?? "null")
  } catch {
    return {}
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const records: SudokuRecords = {}
  for (const difficulty of [0, 1, 2] as const) {
    const time = (value as Record<string, unknown>)[difficulty]
    if (integer(time) && time > 0) records[difficulty] = time
  }
  return records
}

export function readSudokuRecords(): SudokuRecords {
  try {
    return parseRecords(localStorage.getItem(RECORDS_KEY))
  } catch {
    return {}
  }
}

export function saveSudokuRecord(difficulty: Difficulty, elapsedMs: number): number {
  try {
    const records = parseRecords(localStorage.getItem(RECORDS_KEY))
    const stored = records[difficulty]
    if (!integer(difficulty, 2) || !integer(elapsedMs) || elapsedMs === 0) return stored ?? 0
    if (stored && stored <= elapsedMs) return stored
    const best = Math.min(stored ?? elapsedMs, elapsedMs)
    records[difficulty] = best
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
    return best
  } catch {
    return integer(elapsedMs) && elapsedMs > 0 ? elapsedMs : 0
  }
}
