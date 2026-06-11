import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

test("DevImg project assets use the named project pipeline structure", () => {
  assert.ok(exists("devimg.projects.toml"), "project DevImg config should be named")
  assert.ok(exists("public/images/projects-manifest.json"), "project manifest should be named")
  assert.ok(exists("lib/devimg-projects.generated.ts"), "project helper should be named")

  assert.equal(exists("devimg.toml"), false, "generic DevImg config should not remain")
  assert.equal(
    exists("public/images/devimg-manifest.json"),
    false,
    "generic DevImg manifest should not remain"
  )
  assert.equal(exists("lib/devimg.generated.ts"), false, "generic DevImg helper should not remain")
})

test("resume PDFs are served from /downloads", () => {
  for (const locale of locales) {
    assert.ok(
      exists(`public/downloads/resume.${locale}.pdf`),
      `${locale} resume PDF should be in public/downloads`
    )
    assert.equal(
      exists(`public/resume.${locale}.pdf`),
      false,
      `${locale} resume PDF should not remain in the public root`
    )
  }
})
