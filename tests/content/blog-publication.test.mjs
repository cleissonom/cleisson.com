import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const locales = ["en-US", "pt-BR", "es-ES"]
const realPostSlug = "implementation-planning-vs-developing"
const expectedCoverImageByLocale = {
  "en-US": "/images/blog/implementation-planning-vs-developing.en-US.png",
  "pt-BR": "/images/blog/implementation-planning-vs-desenvolvimento.pt-BR.png",
  "es-ES": "/images/blog/implementation-planning-vs-desarrollo.es-ES.png"
}
const expectedMarkdownImageByLocale = {
  "en-US": "/images/blog/implementation-planning-vs-developing.en-US.svg",
  "pt-BR": "/images/blog/implementation-planning-vs-desenvolvimento.pt-BR.svg",
  "es-ES": "/images/blog/implementation-planning-vs-desarrollo.es-ES.svg"
}
const expectedPdfUrlByLocale = {
  "en-US": "/downloads/blog/implementation-planning-vs-developing.en-US.pdf",
  "pt-BR": "/downloads/blog/implementation-planning-vs-desenvolvimento.pt-BR.pdf",
  "es-ES": "/downloads/blog/implementation-planning-vs-desarrollo.es-ES.pdf"
}
const expectedCoverAltByLocale = {
  "en-US":
    "Line chart showing expected developing effort decreasing as implementation planning effort increases",
  "pt-BR":
    "Gráfico de linha mostrando o esforço esperado de desenvolvimento diminuindo conforme o esforço de planejamento de implementação aumenta",
  "es-ES":
    "Gráfico de línea que muestra que el esfuerzo esperado de desarrollo disminuye a medida que aumenta el esfuerzo de planificación de implementación"
}

function readPost(locale, slug) {
  const filePath = path.join(root, "content", "blog", locale, `${slug}.md`)
  const source = fs.readFileSync(filePath, "utf8")
  const match = source.match(/^---\n(?<frontmatter>[\s\S]*?)\n---\n(?<body>[\s\S]*)$/)
  assert.ok(match?.groups, `${filePath} must use YAML frontmatter`)

  return {
    filePath,
    frontmatter: parseSimpleYaml(match.groups.frontmatter),
    body: match.groups.body.trim()
  }
}

function parseSimpleYaml(source) {
  const result = {}
  let activeArrayKey = null

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) {
      continue
    }

    if (line.startsWith("- ")) {
      assert.ok(activeArrayKey, `Unexpected YAML array item: ${line}`)
      result[activeArrayKey].push(unquoteYamlValue(line.slice(2)))
      continue
    }

    const keyMatch = line.match(/^(?<key>[A-Za-z][A-Za-z0-9]*):(?:\s(?<value>.*))?$/)
    assert.ok(keyMatch?.groups, `Unsupported YAML line: ${line}`)

    const { key, value = "" } = keyMatch.groups
    if (value === "") {
      result[key] = []
      activeArrayKey = key
      continue
    }

    result[key] = unquoteYamlValue(value)
    activeArrayKey = null
  }

  return result
}

function unquoteYamlValue(value) {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

test("the blog publishes only the real post in every locale", () => {
  for (const locale of locales) {
    const dir = path.join(root, "content", "blog", locale)
    const slugs = fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.slice(0, -3))
      .sort()

    assert.deepEqual(slugs, [realPostSlug], `${locale} should publish only the real post`)
  }
})

test("the real post has localized content, image metadata, and a PDF download", () => {
  for (const locale of locales) {
    const post = readPost(locale, realPostSlug)

    assert.equal(post.frontmatter.slug, realPostSlug)
    assert.equal(post.frontmatter.lang, locale)
    assert.equal(post.frontmatter.coverImage, expectedCoverImageByLocale[locale])
    assert.equal(post.frontmatter.coverAlt, expectedCoverAltByLocale[locale])
    assert.equal(post.frontmatter.pdfUrl, expectedPdfUrlByLocale[locale])
    assert.equal(post.frontmatter.date, "2026-06-09")
    assert.equal(post.frontmatter.updatedAt, "2026-06-11")
    assert.ok(post.body.includes(`](${expectedMarkdownImageByLocale[locale]})`))
    assert.ok(post.body.length > 3000, `${post.filePath} should contain the translated article`)
  }

  for (const [locale, imageUrl] of Object.entries(expectedCoverImageByLocale)) {
    assert.ok(
      fs.existsSync(path.join(root, "public", imageUrl)),
      `${locale} localized blog cover PNG should exist`
    )
  }
  for (const [locale, imageUrl] of Object.entries(expectedMarkdownImageByLocale)) {
    assert.ok(
      fs.existsSync(path.join(root, "public", imageUrl)),
      `${locale} localized blog inline SVG should exist`
    )
  }
  for (const [locale, pdfUrl] of Object.entries(expectedPdfUrlByLocale)) {
    assert.ok(
      fs.existsSync(path.join(root, "public", pdfUrl)),
      `${locale} blog PDF download should be served from public downloads`
    )
  }

  for (const assetName of [
    "implementation-planning-vs-developing-en-US.png",
    "implementation-planning-vs-developing-en-US.svg",
    "planejamento-de-implementacao-vs-desenvolvimento-pt-BR.png",
    "planejamento-de-implementacao-vs-desenvolvimento-pt-BR.svg",
    "planificacion-de-implementacion-vs-desarrollo-es-ES.png",
    "planificacion-de-implementacion-vs-desarrollo-es-ES.svg"
  ]) {
    assert.equal(fs.existsSync(path.join(root, assetName)), false, `${assetName} should be moved`)
  }
})
