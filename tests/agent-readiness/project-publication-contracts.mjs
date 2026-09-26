import assert from "node:assert/strict"
import { test } from "node:test"

const slug = "hercilia-construcoes"
const locales = ["en-US", "pt-BR", "es-ES"]

async function assertProjectImages(fetchText, html) {
  const sources = [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map((match) => match[1])
  assert.ok(sources.length >= 2, "case study should illustrate the website and catalog")
  for (const source of sources) {
    assert.match(source, /^\/images\/generated\/projects\/hercilia-/)
    const { response } = await fetchText(source)
    assert.equal(response.status, 200, source)
    assert.match(response.headers.get("content-type") ?? "", /^image\//)
  }
}

export function registerProjectPublicationContracts({ fetchText, mainHtml }) {
  for (const locale of locales) {
    test(`Hercília Construções publishes equivalent HTML, Markdown and REST data in ${locale}`, async () => {
      const pathname = `/${locale}/projects/${slug}`
      const html = await fetchText(pathname)
      assert.equal(html.response.status, 200, pathname)
      assert.match(mainHtml(html.body), /<h1\b[^>]*>Hercília Construções<\/h1>/)
      assert.match(mainHtml(html.body), /Picos/)
      await assertProjectImages(fetchText, mainHtml(html.body))

      const markdown = await fetchText(pathname, { headers: { Accept: "text/markdown" } })
      const explicit = await fetchText(`${pathname}.md`)
      for (const result of [markdown, explicit]) {
        assert.equal(result.response.status, 200)
        assert.match(result.response.headers.get("content-type") ?? "", /^text\/markdown/)
        assert.match(result.body, /^# Hercília Construções\n/)
      }
      assert.equal(markdown.body, explicit.body)

      const api = await fetchText(`/api/v1/projects/${slug}?locale=${locale}`)
      assert.equal(api.response.status, 200)
      const project = JSON.parse(api.body)
      assert.equal(project.locale, locale)
      assert.equal(project.sourceUrl, `https://www.cleisson.com${pathname}`)
      assert.equal(project.found, true)
      assert.ok(project.project.artifactUrls.includes("https://www.herciliaconstrucoes.com"))
      for (const highlight of project.project.highlights)
        assert.ok(markdown.body.includes(highlight))

      const index = await fetchText(`/${locale}/projects.md`)
      assert.ok(index.body.includes(`](${pathname})`))
      const sitemap = await fetchText("/sitemap.xml")
      assert.ok(sitemap.body.includes(`<loc>https://www.cleisson.com${pathname}</loc>`))
      const instructions = await fetchText("/llms.txt")
      assert.ok(instructions.body.includes(`https://www.cleisson.com${pathname}.md`))
    })
  }
}
