import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]
const resumeSha256ByLocale = {
  "en-US": "49c29a9874a37bc39de8588f997a24e869e44756e943b2009965de02f2084982",
  "pt-BR": "97944ab0ab2192a40a742180a7d7e0aa7be8331381732c324be34d8a777d599a",
  "es-ES": "109e70ac0c6e4848334cde9465db9020e8f8a524ff83a242844cb4d48246bdf7"
}

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
    const relativePath = `public/downloads/resume.${locale}.pdf`
    assert.ok(exists(relativePath), `${locale} resume PDF should be in public/downloads`)
    assert.equal(
      exists(`public/resume.${locale}.pdf`),
      false,
      `${locale} resume PDF should not remain in the public root`
    )

    const digest = createHash("sha256")
      .update(fs.readFileSync(path.join(root, relativePath)))
      .digest("hex")
    assert.equal(digest, resumeSha256ByLocale[locale], `${locale} should use the supplied PDF`)
  }
})
