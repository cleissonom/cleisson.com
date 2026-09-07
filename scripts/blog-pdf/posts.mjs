import fs from "node:fs"
import { parseBlogSource } from "../../lib/content-source.ts"
import { LOCALES, isLocale, buildLocalizedPath } from "../../lib/i18n.ts"
import { SITE_URL } from "../../lib/site.ts"
import { pdfOutput, projectPath } from "./paths.mjs"
import { atomicWrite } from "./state.mjs"

function validateDate(value, label) {
  const date = new Date(value)
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T.*Z)?$/.test(value) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value.slice(0, 10)
  ) {
    throw new Error(`Invalid ${label}: ${value}`)
  }
}

function validateSourceDates(sourceBytes, source, post) {
  // YAML timestamps normalize impossible dates before Zod sees them. Check the
  // authored scalar too; require the documented single-line ISO date notation.
  const yaml = sourceBytes.toString("utf8").split(/\r?\n---(?:\r?\n|$)/, 1)[0]
  for (const key of ["date", "updatedAt"]) {
    if (!post[key]) continue
    const scalar = yaml.match(new RegExp(`^${key}: *["']?([0-9TZ:.+-]+)["']? *(?:#.*)?$`, "m"))?.[1]
    if (!scalar) throw new Error(`Invalid ${key} in ${source}: use a single-line ISO date`)
    validateDate(scalar, `${key} in ${source}`)
  }
}

function readPost(root, locale, filename) {
  const source = `content/blog/${locale}/${filename}`
  const sourceBytes = fs.readFileSync(projectPath(root, source))
  const post = parseBlogSource(sourceBytes.toString("utf8"), source, locale)
  validateSourceDates(sourceBytes, source, post)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || filename !== `${post.slug}.md`)
    throw new Error(`Invalid slug or source filename: ${source}`)
  validateDate(post.date, `publication date in ${source}`)
  if (post.updatedAt) validateDate(post.updatedAt, `updated date in ${source}`)
  if (post.updatedAt && Date.parse(post.updatedAt) < Date.parse(post.date))
    throw new Error(`Updated date precedes publication in ${source}`)
  if (!post.body || !post.title.trim()) throw new Error(`Empty article or title in ${source}`)
  const pdfUrl = post.pdfUrl ?? `/downloads/blog/${post.slug}.${locale}.pdf`
  const sourceUrl = new URL(buildLocalizedPath(locale, `/blog/${post.slug}`), SITE_URL).href
  return {
    ...post,
    source,
    sourceBytes,
    sourceUrl,
    pdfUrl,
    needsWiring: !post.pdfUrl,
    output: pdfOutput(root, pdfUrl)
  }
}

export function discoverPosts(root) {
  const directory = projectPath(root, "content/blog")
  if (!fs.existsSync(directory)) throw new Error("Missing blog source directory: content/blog")
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!isLocale(entry.name)) throw new Error(`Unexpected blog source or locale: ${entry.name}`)
  }
  const posts = LOCALES.flatMap((locale) => {
    const dir = projectPath(root, `content/blog/${locale}`)
    if (!fs.existsSync(dir)) throw new Error(`Missing locale source directory: ${locale}`)
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((file) => readPost(root, locale, file))
  })
  const destinations = new Set()
  for (const post of posts) {
    const key = post.pdfUrl.toLowerCase()
    if (destinations.has(key)) throw new Error(`Duplicate PDF destination: ${post.pdfUrl}`)
    destinations.add(key)
  }
  return posts
}

export function selectPosts(posts, { slug, locale } = {}) {
  if (locale && !isLocale(locale)) throw new Error(`Unsupported locale: ${locale}`)
  if (slug && !locale) throw new Error("A single post requires both --slug and --locale")
  const selected = posts.filter(
    (post) => (!slug || post.slug === slug) && (!locale || post.locale === locale)
  )
  if (!selected.length) throw new Error("No published post matches the selection")
  return selected
}

export function wirePdfUrl(root, post) {
  const source = fs.readFileSync(projectPath(root, post.source), "utf8")
  const current = parseBlogSource(source, post.source, post.locale)
  if (current.pdfUrl) return Buffer.from(source)
  if (source !== post.sourceBytes.toString("utf8"))
    throw new Error(`Source changed during generation: ${post.source}`)
  const newline = source.includes("\r\n") ? "\r\n" : "\n"
  const wired = source.replace(/^(\uFEFF?---\r?\n|---\r?\n)/, `$1pdfUrl: ${post.pdfUrl}${newline}`)
  if (wired === source) throw new Error(`Cannot add pdfUrl to frontmatter: ${post.source}`)
  atomicWrite(root, post.source, wired)
  return Buffer.from(wired)
}
