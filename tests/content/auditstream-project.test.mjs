import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"
import matter from "gray-matter"

const root = process.cwd()

test("Auditstream is published in every locale with its repository and documentation", () => {
  for (const locale of ["en-US", "pt-BR", "es-ES"]) {
    const filePath = path.join(root, "content", "projects", locale, "auditstream.md")
    const { data, content } = matter(fs.readFileSync(filePath, "utf8"))
    assert.equal(data.title, "Auditstream")
    assert.equal(data.slug, "auditstream")
    assert.notEqual(data.stage, "in-progress", `${locale} has a public case study`)
    assert.deepEqual(data.links, {
      repo: "https://github.com/auditstream/auditstream",
      live: "https://auditstream.dev"
    })
    assert.ok(data.tags.includes("Audit Logs"), `${locale} stays filterable by Audit Logs`)
    assert.ok(content.includes("](https://auditstream.dev/docs/)"), `${locale} links the docs`)
  }
})
