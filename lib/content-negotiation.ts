export type Representation = "text/html" | "text/markdown"

type AcceptEntry = {
  type: string
  quality: number
  specificity: number
  position: number
}

const REPRESENTATIONS: Representation[] = ["text/html", "text/markdown"]
const VARY_TOKENS = ["Accept", "Accept-Encoding"] as const

function parseQuality(parameters: string[]): number {
  const quality = parameters.find((parameter) => parameter.toLowerCase().startsWith("q="))
  if (!quality) return 1

  const parsed = Number(quality.slice(2))
  return Number.isNaN(parsed) ? 1 : Math.max(0, Math.min(1, parsed))
}

function specificity(type: string): number {
  if (type === "*/*") return 0
  return type.endsWith("/*") ? 1 : 2
}

function parseEntry(raw: string, position: number): AcceptEntry | null {
  const [typeValue, ...parameters] = raw.split(";").map((part) => part.trim())
  const type = typeValue.toLowerCase()
  if (!type) return null

  return {
    type,
    quality: parseQuality(parameters),
    specificity: specificity(type),
    position
  }
}

function parseAccept(header: string): AcceptEntry[] {
  return header
    .split(",")
    .map(parseEntry)
    .filter((entry): entry is AcceptEntry => entry !== null)
}

function matches(entry: AcceptEntry, candidate: Representation): boolean {
  if (entry.type === "*/*") return true
  if (entry.type.endsWith("/*")) return candidate.startsWith(entry.type.slice(0, -1))
  return entry.type === candidate
}

function matchingPreference(entries: AcceptEntry[], candidate: Representation) {
  return entries.reduce<AcceptEntry | null>((best, entry) => {
    if (!matches(entry, candidate)) return best
    if (!best || entry.specificity > best.specificity) return entry
    return best
  }, null)
}

export function preferredRepresentation(header: string | null): Representation | null {
  if (header === null) return REPRESENTATIONS[0]
  const entries = parseAccept(header)
  if (entries.length === 0) return null

  const candidates = REPRESENTATIONS.map((type) => ({
    type,
    preference: matchingPreference(entries, type)
  })).filter(({ preference }) => preference && preference.quality > 0)

  candidates.sort((left, right) => {
    const qualityOrder = right.preference!.quality - left.preference!.quality
    return qualityOrder || left.preference!.position - right.preference!.position
  })

  return candidates[0]?.type ?? null
}

export function appendNegotiationVary(headers: Headers): void {
  const existing = headers.get("Vary") ?? ""
  const normalized = existing.split(",").map((token) => token.trim().toLowerCase())
  if (normalized.includes("*")) return

  const additions = VARY_TOKENS.filter((token) => !normalized.includes(token.toLowerCase()))
  headers.set("Vary", [existing, ...additions].filter(Boolean).join(", "))
}
