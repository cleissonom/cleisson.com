import fs from "node:fs"
import path from "node:path"
import { prepareDocument } from "./document.mjs"
import { projectPath } from "./paths.mjs"

import { inputHash, sha256 } from "./fingerprint.mjs"

export { inputHash, sha256 } from "./fingerprint.mjs"

export const manifestPath = "scripts/blog-pdf/manifest.json"
export function readManifest(root) {
  const file = projectPath(root, manifestPath)
  if (!fs.existsSync(file)) return { version: 1, entries: {} }
  const manifest = JSON.parse(fs.readFileSync(file, "utf8"))
  if (
    manifest.version !== 1 ||
    !manifest.entries ||
    Array.isArray(manifest.entries) ||
    typeof manifest.entries !== "object"
  )
    throw new Error("Invalid blog PDF manifest")
  return manifest
}

export function outputIssues(root, document, record) {
  const { post } = document
  const issues = []
  if (post.needsWiring) issues.push(`Missing pdfUrl: ${post.source} -> ${post.pdfUrl}`)
  const file = projectPath(root, post.output)
  if (!fs.existsSync(file)) issues.push(`Missing PDF: ${post.output}`)
  else if (!record || sha256(fs.readFileSync(file)) !== record.pdfHash)
    issues.push(`Changed PDF or untracked output: ${post.output}`)
  if (!record || record.inputHash !== inputHash(root, document) || record.source !== post.source)
    issues.push(`Outdated PDF: ${post.output}`)
  return issues
}

function orphanIssues(root, posts, manifest) {
  const issues = []
  const sources = new Set(posts.map((post) => post.source))
  for (const record of Object.values(manifest.entries)) {
    if (!sources.has(record.source))
      issues.push(`Missing source: ${record.source} (${record.pdfUrl})`)
  }
  const directory = projectPath(root, "public/downloads/blog")
  if (!fs.existsSync(directory)) return issues
  const outputs = new Set(posts.map((post) => post.output))
  for (const file of fs.readdirSync(directory, { recursive: true }).sort()) {
    const relative = `public/downloads/blog/${file}`
    projectPath(root, relative)
    if (/\.pdf$/i.test(file) && !outputs.has(relative)) issues.push(`Orphaned PDF: ${relative}`)
  }
  return issues
}

export function inspectOutputs(root, posts, manifest, selected = posts) {
  const documents = selected.map((post) => prepareDocument(root, post))
  const issues = documents.flatMap((document) =>
    outputIssues(root, document, manifest.entries[document.post.pdfUrl])
  )
  return { documents, issues: [...issues, ...orphanIssues(root, posts, manifest)] }
}

// Stage outside public downloads, then rename on the same filesystem. A failed
// render never reaches this function; a failed write cannot truncate the target.
export function atomicWrite(root, relative, bytes) {
  const target = projectPath(root, relative)
  if (
    fs.existsSync(target) &&
    bytes !== undefined &&
    fs.readFileSync(target).equals(Buffer.from(bytes))
  )
    return
  const staging = projectPath(root, "output/playwright/blog-pdf")
  fs.mkdirSync(staging, { recursive: true })
  const temporary = fs.mkdtempSync(path.join(staging, "staging-"))
  try {
    const file = path.join(temporary, "output")
    fs.writeFileSync(file, bytes, { flag: "wx" })
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.renameSync(file, projectPath(root, relative))
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true })
  }
}
