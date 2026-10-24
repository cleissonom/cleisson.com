const STORAGE_KEY = "falling-blocks.best-score"

function parseScore(value: string | null): number {
  const score = Number(value)
  return /^\d+$/.test(value ?? "") && Number.isInteger(score) && score <= 0xffffffff ? score : 0
}

export function readBestScore(): number {
  try {
    return parseScore(localStorage.getItem(STORAGE_KEY))
  } catch {
    return 0
  }
}

export function saveBestScore(score: number): number {
  try {
    const stored = parseScore(localStorage.getItem(STORAGE_KEY))
    if (stored >= score) return stored
    localStorage.setItem(STORAGE_KEY, String(score))
  } catch {
    // A blocked or full store must not interrupt play; retain this visit's record.
  }
  return score
}
