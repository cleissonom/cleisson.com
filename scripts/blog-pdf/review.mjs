import fs from "node:fs"
import path from "node:path"
import { discoverPosts } from "./posts.mjs"
import { inspectOutputs, readManifest } from "./state.mjs"
import { SITE_NAME } from "../../lib/site.ts"

const root = process.cwd()
const reviewDir = path.join(root, "output/playwright/blog-pdf/review")
const { documents, issues } = inspectOutputs(root, discoverPosts(root), readManifest(root))
if (issues.length) throw new Error(`Refresh PDFs before review:\n${issues.join("\n")}`)
fs.mkdirSync(reviewDir, { recursive: true })
const records = documents.map(({ post, html }) => {
  const preview = `${post.slug}.${post.locale}.html`
  fs.writeFileSync(path.join(reviewDir, preview), html)
  return {
    pdf: post.output,
    preview,
    title: post.title,
    author: SITE_NAME,
    locale: post.locale,
    sourceUrl: post.sourceUrl,
    date: post.date,
    updatedAt: post.updatedAt ?? post.date
  }
})
fs.writeFileSync(path.join(reviewDir, "documents.json"), `${JSON.stringify(records, null, 2)}\n`)
console.log(
  `Review inputs: ${path.relative(root, reviewDir)} (run scripts/blog-pdf/validate.py with PyMuPDF)`
)
