import { readdirSync } from "node:fs"

export function projectCount(locale) {
  return readdirSync(new URL(`../../content/projects/${locale}/`, import.meta.url)).filter((name) =>
    name.endsWith(".md")
  ).length
}
