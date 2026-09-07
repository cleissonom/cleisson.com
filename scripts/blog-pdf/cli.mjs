import { parseArgs } from "node:util"
import { chromium } from "@playwright/test"
import { discoverPosts, selectPosts, wirePdfUrl } from "./posts.mjs"
import { renderPdf } from "./render.mjs"
import { assertInputsUnchanged } from "./fingerprint.mjs"
import {
  atomicWrite,
  inputHash,
  inspectOutputs,
  outputIssues,
  manifestPath,
  readManifest,
  sha256
} from "./state.mjs"

const help = `Static blog PDFs (run from the repository root)
  npm run blog:pdf -- --slug <slug> --locale <locale>
  npm run blog:pdf                 Generate missing/outdated published PDFs
  npm run blog:pdf -- --force      Regenerate even current PDFs
  npm run blog:pdf:check           Read-only verification, exits 1 on problems
Options: --locale en-US|pt-BR|es-ES, --slug <slug>, --check, --force, --help
Setup: npm ci; npx playwright install chromium
Optional: PLAYWRIGHT_CHANNEL=chrome to use installed Chrome.`

function options() {
  const { values } = parseArgs({
    options: {
      slug: { type: "string" },
      locale: { type: "string" },
      check: { type: "boolean" },
      force: { type: "boolean" },
      help: { type: "boolean" }
    }
  })
  if (values.check && values.force) throw new Error("--check cannot be combined with --force")
  return values
}

async function generate(root, documents, manifest, force) {
  let browser
  try {
    for (const document of documents) {
      const { post } = document
      if (!force && !outputIssues(root, document, manifest.entries[post.pdfUrl]).length) {
        console.log(`Current: ${post.output}`)
        continue
      }
      browser ??= await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chromium" })
      const bytes = await renderPdf(browser, document)
      assertInputsUnchanged(root, document)
      atomicWrite(root, post.output, bytes)
      if (post.needsWiring) document.inputs[post.source] = sha256(wirePdfUrl(root, post))
      manifest.entries[post.pdfUrl] = {
        source: post.source,
        pdfUrl: post.pdfUrl,
        inputHash: inputHash(root, document),
        pdfHash: sha256(bytes),
        renderer: {
          browser: browser.version(),
          platform: process.platform,
          arch: process.arch,
          node: process.version,
          channel: process.env.PLAYWRIGHT_CHANNEL || "chromium"
        }
      }
      const entries = Object.fromEntries(
        Object.entries(manifest.entries).sort(([a], [b]) => a.localeCompare(b))
      )
      atomicWrite(root, manifestPath, `${JSON.stringify({ version: 1, entries }, null, 2)}\n`)
      console.log(`Generated: ${post.output} (${bytes.length} bytes)`)
    }
  } finally {
    await browser?.close()
  }
}

async function main() {
  const args = options()
  if (args.help) return console.log(help)
  const root = process.cwd()
  const posts = discoverPosts(root)
  const selected = selectPosts(posts, args)
  const manifest = readManifest(root)
  const { documents, issues } = inspectOutputs(root, posts, manifest, selected)
  if (args.check) {
    for (const issue of issues) console.error(issue)
    if (issues.length) process.exitCode = 1
    else console.log(`Current: ${selected.length} blog PDFs; all source and output hashes match.`)
    return
  }
  for (const issue of issues.filter((issue) => /^(Orphaned PDF|Missing source):/.test(issue)))
    console.warn(issue)
  await generate(root, documents, manifest, args.force)
}

main().catch((error) => {
  console.error(`Blog PDF generation failed: ${error.message}`)
  process.exitCode = 1
})
