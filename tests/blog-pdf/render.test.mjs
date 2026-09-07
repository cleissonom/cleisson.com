import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { PDFDocument, PDFName } from "pdf-lib"

const cli = path.resolve("scripts/blog-pdf/cli.mjs")

function run(root, ...args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 60_000
  })
}

function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "blog-pdf-render-"))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  for (const name of ["scripts/blog-pdf", "lib", "package-lock.json"]) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    fs.cpSync(path.resolve(name), path.join(root, name), { recursive: true })
  }
  fs.rmSync(path.join(root, "scripts/blog-pdf/manifest.json"), { force: true })
  for (const locale of ["en-US", "pt-BR", "es-ES"])
    fs.mkdirSync(path.join(root, "content/blog", locale), { recursive: true })
  return root
}

function source(root, locale) {
  const code = `const url = "https://example.org/${"long".repeat(70)}"`
  const table = `| Long URL | Language |\n| --- | --- |\n| https://example.org/${"path".repeat(90)} | Ação, ¿por qué?, Español |`
  const paragraphs = Array.from(
    { length: 18 },
    (_, i) =>
      `## Section ${i + 1}\n\nParagraph ${i + 1}. Ação, implementação, ¿por qué?, español. ${"Selectable article text. ".repeat(8)}`
  ).join("\n\n")
  const body = `Beginning.\n\n> Quotation preserved.\n\n- [x] Completed\n- A second item\n\n\`\`\`js\n${code}\n\`\`\`\n\n${table}\n\n[Relative](/pt-BR/about)\n\n${paragraphs}\n\nEnding.`
  const content = `---\ntitle: "Ação, ¿por qué?"\nslug: example\nsummary: Print layout fixture\ndate: 2026-06-09\nupdatedAt: 2026-09-05\ntags: [Engineering]\nlang: ${locale}\n---\n\n${body}\n`
  fs.writeFileSync(path.join(root, `content/blog/${locale}/example.md`), content)
}

test(
  "CLI generates selectable multilingual PDFs, preserves links/metadata, repeats exactly and retains downloads after failed rendering",
  { timeout: 120_000 },
  async (t) => {
    const root = workspace(t)
    for (const locale of ["en-US", "pt-BR", "es-ES"]) source(root, locale)
    const red = run(root, "--check")
    assert.equal(red.status, 1)
    assert.match(red.stderr, /Missing PDF/)
    const generated = run(root)
    assert.equal(generated.status, 0, generated.stderr)
    const original = new Map()
    for (const locale of ["en-US", "pt-BR", "es-ES"]) {
      const file = path.join(root, `public/downloads/blog/example.${locale}.pdf`)
      const bytes = fs.readFileSync(file)
      original.set(file, bytes)
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false })
      assert.ok(pdf.getPageCount() >= 4)
      assert.equal(pdf.getTitle(), "Ação, ¿por qué?")
      assert.equal(pdf.getAuthor(), "Cleisson de Oliveira Moura")
      assert.equal(pdf.catalog.get(PDFName.of("Lang")).decodeText(), locale)
      assert.equal(pdf.getCreationDate().toISOString(), "2026-06-09T00:00:00.000Z")
      assert.equal(pdf.getModificationDate().toISOString(), "2026-09-05T00:00:00.000Z")
      const urls = pdf
        .getPages()
        .flatMap((page) =>
          (page.node.Annots()?.asArray() ?? []).map((ref) =>
            pdf.context.lookup(ref).lookup(PDFName.of("A"))?.lookup(PDFName.of("URI"))?.decodeText()
          )
        )
      assert.ok(urls.includes(`https://www.cleisson.com/${locale}/blog/example`))
      assert.ok(urls.includes("https://www.cleisson.com/pt-BR/about"))
    }
    assert.equal(run(root, "--check").status, 0)
    assert.equal(run(root).status, 0)
    assert.equal(run(root, "--force").status, 0)
    for (const [file, bytes] of original) assert.deepEqual(fs.readFileSync(file), bytes)
    const article = path.join(root, "content/blog/en-US/example.md")
    fs.appendFileSync(article, "\n![Broken](/broken.png)\n")
    fs.writeFileSync(path.join(root, "public/broken.png"), "not an image")
    const failure = run(root, "--slug", "example", "--locale", "en-US")
    assert.equal(failure.status, 1)
    assert.match(failure.stderr, /Unreadable image/)
    for (const [file, bytes] of original) assert.deepEqual(fs.readFileSync(file), bytes)
    assert.equal(run(root, "--check").status, 1)
  }
)
