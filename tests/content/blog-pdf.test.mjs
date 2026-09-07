import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import { discoverPosts, selectPosts, wirePdfUrl } from "../../scripts/blog-pdf/posts.mjs"
import { prepareDocument } from "../../scripts/blog-pdf/document.mjs"
import { atomicWrite, inspectOutputs, inputHash, sha256 } from "../../scripts/blog-pdf/state.mjs"
import { assertInputsUnchanged } from "../../scripts/blog-pdf/fingerprint.mjs"

const locales = ["en-US", "pt-BR", "es-ES"]

function write(root, file, content) {
  const target = path.join(root, file)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, content)
  return target
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-pdf-test-"))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  for (const locale of locales)
    fs.mkdirSync(path.join(root, "content/blog", locale), { recursive: true })
  for (const file of [
    "scripts/blog-pdf",
    "lib/content-source.ts",
    "lib/i18n.ts",
    "lib/site.ts",
    "lib/display-date.ts",
    "package-lock.json"
  ]) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
    fs.cpSync(path.resolve(file), path.join(root, file), { recursive: true })
  }
  return root
}

function post(
  root,
  locale = "en-US",
  extra = "",
  body = "Beginning.\n\n## Middle\n\nEnding.",
  slug = "example"
) {
  return write(
    root,
    `content/blog/${locale}/${slug}.md`,
    `---\ntitle: "Ação, ¿por qué?"\nslug: ${slug}\nsummary: A full article\ndate: 2026-06-09\nupdatedAt: 2026-09-05\ntags: [Engineering]\nlang: ${locale}\n${extra}---\n\n${body}\n`
  )
}

test("preserves every existing localized download URL and selects the requested source", () => {
  const posts = discoverPosts(process.cwd())
  assert.equal(posts.length, 3)
  for (const locale of locales) {
    const [entry] = selectPosts(posts, { slug: "implementation-planning-vs-developing", locale })
    const suffix = { "en-US": "developing", "pt-BR": "desenvolvimento", "es-ES": "desarrollo" }[
      locale
    ]
    assert.equal(entry.pdfUrl, `/downloads/blog/implementation-planning-vs-${suffix}.${locale}.pdf`)
    assert.equal(entry.output, `public${entry.pdfUrl}`)
    assert.equal(entry.lang, locale)
    assert.match(entry.sourceUrl, new RegExp(`/${locale}/blog/${entry.slug}$`))
  }
  assert.throws(() => selectPosts(posts, { slug: "missing", locale: "en-US" }), /No published post/)
  assert.throws(() => selectPosts(posts, { locale: "fr-FR" }), /locale/i)
})

test("unmapped posts get collision-safe URLs and wiring preserves the exact body and other metadata", (t) => {
  const root = fixture(t)
  for (const locale of locales) post(root, locale)
  for (const entry of discoverPosts(root)) {
    assert.equal(entry.pdfUrl, `/downloads/blog/example.${entry.locale}.pdf`)
    const before = fs.readFileSync(path.join(root, entry.source), "utf8")
    wirePdfUrl(root, entry)
    const after = fs.readFileSync(path.join(root, entry.source), "utf8")
    assert.equal(after.replace(`pdfUrl: ${entry.pdfUrl}\n`, ""), before)
    wirePdfUrl(root, entry)
    assert.equal(fs.readFileSync(path.join(root, entry.source), "utf8"), after)
  }
})

test("rejects unsafe and duplicate destinations, invalid dates, slugs, language and executable frontmatter", (t) => {
  const root = fixture(t)
  const file = post(root)
  const valid = fs.readFileSync(file, "utf8")
  for (const value of [
    "/other/file.pdf",
    "/downloads/blog/../file.pdf",
    "/downloads/blog/%2e%2e/file.pdf",
    "/downloads/blog/a.pdf?x=1",
    "/downloads/blog/a\\b.pdf",
    "https://example.org/a.pdf"
  ]) {
    post(root, "en-US", `pdfUrl: '${value}'\n`)
    assert.throws(() => discoverPosts(root), /path|PDF|URL|destination/i)
  }
  for (const [from, to] of [
    ["lang: en-US", "lang: pt-BR"],
    ["2026-06-09", "2026-02-30"],
    ["2026-09-05", "2026-01-01"],
    ["slug: example", "slug: ../example"],
    ['title: "Ação, ¿por qué?"', "title: ''"]
  ]) {
    fs.writeFileSync(file, valid.replace(from, to))
    assert.throws(() => discoverPosts(root))
  }
  fs.writeFileSync(file, "---js\nthrow new Error('must not execute')\n---\ntext")
  assert.throws(() => discoverPosts(root), /Only YAML/)
  post(root, "en-US", "pdfUrl: /downloads/blog/shared.pdf\n")
  post(root, "pt-BR", "pdfUrl: /downloads/blog/shared.pdf\n")
  assert.throws(() => discoverPosts(root), /Duplicate PDF destination/)
})

test("rejects symlink escapes, unknown source locales and missing source directories", (t) => {
  const root = fixture(t)
  post(root)
  fs.mkdirSync(path.join(root, "public/downloads"), { recursive: true })
  fs.symlinkSync(os.tmpdir(), path.join(root, "public/downloads/blog"))
  assert.throws(() => discoverPosts(root), /symlink/i)
  fs.unlinkSync(path.join(root, "public/downloads/blog"))
  post(root, "fr-FR")
  assert.throws(() => discoverPosts(root), /locale/i)
  fs.rmSync(path.join(root, "content/blog"), { recursive: true })
  assert.throws(() => discoverPosts(root), /source/i)
})

test("renders complete GFM, localized metadata, local assets and canonical relative links without executing article code", (t) => {
  const root = fixture(t)
  write(
    root,
    "public/chart.svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path d="M0 0L10 10"/></svg>'
  )
  const body =
    "Beginning.\n\n## Middle\n\n> Quotation\n\n- [x] Done\n- Item\n\n```js\nthrow new Error('do not run')\n```\n\n| Label | Value |\n| --- | --- |\n| ação | ¿sí? |\n\n![Chart](/chart.svg)\n\n[Local](/pt-BR/about) [Relative](another) [External](https://example.org/)\n\n<script>alert('never')</script>\n\nEnding."
  post(root, "pt-BR", "", body)
  const document = prepareDocument(root, discoverPosts(root)[0])
  for (const fragment of [
    "Beginning.",
    "Middle",
    "Quotation",
    "Ending.",
    "ação",
    "¿sí?",
    "<table>",
    "<pre>",
    "<blockquote>",
    "do not run",
    "Publicado",
    "Atualizado",
    'lang="pt-BR"',
    "9 de junho de 2026",
    "5 de setembro de 2026"
  ])
    assert.ok(document.html.includes(fragment), fragment)
  assert.match(document.html, /data:image\/svg\+xml;base64,/)
  assert.match(document.html, /href="https:\/\/www.cleisson.com\/pt-BR\/about"/)
  assert.match(document.html, /href="https:\/\/www.cleisson.com\/pt-BR\/blog\/another"/)
  assert.doesNotMatch(document.html, /<script>/)
  assert.equal(document.assets.length, 1)
})

test("missing, remote and externally dependent SVG images fail explicitly", (t) => {
  const root = fixture(t)
  for (const image of ["/missing.svg", "https://example.org/chart.png", "/%2e%2e/secret.png"]) {
    post(root, "en-US", "", `![Chart](${image})`)
    assert.throws(() => prepareDocument(root, discoverPosts(root)[0]), /asset|image|path/i)
  }
  write(
    root,
    "public/chart.svg",
    '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.org/a.png"/></svg>'
  )
  post(root, "en-US", "", "![Chart](/chart.svg)")
  assert.throws(() => prepareDocument(root, discoverPosts(root)[0]), /SVG/i)
})

function trackedOutput(root) {
  post(root, "en-US", "pdfUrl: /downloads/blog/example.en-US.pdf\n", "![Chart](/chart.svg)")
  write(
    root,
    "public/chart.svg",
    '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'
  )
  const entry = discoverPosts(root)[0]
  const pdf = Buffer.from("%PDF-1.7\nfixture\n%%EOF\n")
  write(root, entry.output, pdf)
  const record = {
    source: entry.source,
    pdfUrl: entry.pdfUrl,
    inputHash: inputHash(root, prepareDocument(root, entry)),
    pdfHash: sha256(pdf)
  }
  return { entry, manifest: { version: 1, entries: { [entry.pdfUrl]: record } } }
}

test("read-only checks distinguish current, missing, outdated, damaged and orphaned outputs", (t) => {
  const root = fixture(t)
  const { entry, manifest } = trackedOutput(root)
  const inspect = () => inspectOutputs(root, discoverPosts(root), manifest)
  assert.deepEqual(inspect().issues, [])
  const file = path.join(root, entry.output)
  const original = fs.readFileSync(file)
  fs.unlinkSync(file)
  assert.match(inspect().issues.join("\n"), /Missing PDF/)
  fs.writeFileSync(file, "truncated")
  assert.match(inspect().issues.join("\n"), /Changed PDF/)
  fs.writeFileSync(file, original)
  fs.appendFileSync(path.join(root, entry.source), "\nNew conclusion.\n")
  const before = fs.statSync(file).mtimeMs
  assert.match(inspect().issues.join("\n"), /Outdated PDF/)
  assert.equal(fs.statSync(file).mtimeMs, before)
  write(root, "public/downloads/blog/orphan.pdf", original)
  assert.match(inspect().issues.join("\n"), /Orphaned PDF/)
  fs.unlinkSync(path.join(root, entry.source))
  assert.match(inspect().issues.join("\n"), /Missing source/)
})

test("staleness includes asset bytes, metadata, renderer templates and dependency versions", (t) => {
  for (const file of [
    "public/chart.svg",
    "scripts/blog-pdf/print.css",
    "scripts/blog-pdf/document.mjs",
    "lib/site.ts",
    "package-lock.json"
  ]) {
    const root = fixture(t)
    const { manifest } = trackedOutput(root)
    fs.appendFileSync(path.join(root, file), "\n ")
    assert.match(
      inspectOutputs(root, discoverPosts(root), manifest).issues.join("\n"),
      /Outdated PDF/,
      file
    )
  }
})

test("atomic writes retain working outputs when staging fails and do not churn identical bytes", (t) => {
  const root = fixture(t)
  const target = write(root, "public/downloads/blog/working.pdf", "working PDF")
  const before = fs.statSync(target).mtimeMs
  atomicWrite(root, "public/downloads/blog/working.pdf", Buffer.from("working PDF"))
  assert.equal(fs.statSync(target).mtimeMs, before)
  assert.throws(() => atomicWrite(root, "public/downloads/blog/working.pdf", undefined))
  assert.equal(fs.readFileSync(target, "utf8"), "working PDF")
  assert.deepEqual(fs.readdirSync(path.dirname(target)), ["working.pdf"])
})

test("rendered input snapshots never certify edits made after source or image capture", (t) => {
  const root = fixture(t)
  const { entry, manifest } = trackedOutput(root)
  const captured = prepareDocument(root, entry)
  const originalHash = inputHash(root, captured)
  fs.appendFileSync(path.join(root, entry.source), "\nNew source text during rendering.\n")
  fs.appendFileSync(path.join(root, "public/chart.svg"), "\n ")
  fs.appendFileSync(path.join(root, "scripts/blog-pdf/document.mjs"), "\n ")
  assert.equal(inputHash(root, captured), originalHash)
  assert.throws(() => assertInputsUnchanged(root, captured), /Input changed during generation/)
  manifest.entries[entry.pdfUrl].inputHash = inputHash(root, captured)
  assert.match(
    inspectOutputs(root, discoverPosts(root), manifest).issues.join("\n"),
    /Outdated PDF/
  )
})

test("BOM and CRLF sources keep their original bytes except missing PDF metadata", (t) => {
  const root = fixture(t)
  const file = post(root)
  const before = `\uFEFF${fs.readFileSync(file, "utf8").replaceAll("\n", "\r\n")}`
  fs.writeFileSync(file, before)
  const entry = discoverPosts(root)[0]
  wirePdfUrl(root, entry)
  assert.equal(fs.readFileSync(file, "utf8").replace(`pdfUrl: ${entry.pdfUrl}\r\n`, ""), before)
})
