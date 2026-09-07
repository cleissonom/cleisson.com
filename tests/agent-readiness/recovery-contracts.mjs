import assert from "node:assert/strict"
import { test } from "node:test"

export function registerRecoveryContracts({
  fetchText,
  assertHtmlHeaders,
  assertNegotiatedHeaders,
  mainHtml
}) {
  test("unknown paths return agent-friendly 404 responses without redirects", async () => {
    const pathname = "/ora-agent-readiness-probe-404"
    const html = await fetchText(pathname, { redirect: "manual" })
    assert.equal(html.response.status, 404)
    assertHtmlHeaders(html.response)
    assert.match(html.body, /href="\/sitemap\.xml"/)
    assert.match(html.body, /href="\/llms\.txt"/)

    const markdown = await fetchText(pathname, {
      redirect: "manual",
      headers: { Accept: "text/markdown" }
    })
    assert.equal(markdown.response.status, 404)
    assertNegotiatedHeaders(markdown.response, /^text\/markdown;\s*charset=utf-8$/i)
    assert.match(markdown.body, /\[Sitemap\]\(\/sitemap\.xml\)/)
    assert.match(markdown.body, /\[Agent instructions\]\(\/llms\.txt\)/)
  })

  test("explicit and nested missing routes use the recovery 404", async () => {
    for (const pathname of [
      "/en-US/404",
      "/en-US/blog/does-not-exist",
      "/en-US/projects/does-not-exist",
      "/projects/does-not-exist",
      "/mcp/does-not-exist"
    ]) {
      const { response, body } = await fetchText(pathname, { redirect: "manual" })
      assert.equal(response.status, 404, pathname)
      assertHtmlHeaders(response)
      assert.match(mainHtml(body), /href="\/sitemap\.xml"/, pathname)
      assert.match(mainHtml(body), /href="\/llms\.txt"/, pathname)
    }

    const unacceptable = await fetchText("/en-US/projects/does-not-exist", {
      redirect: "manual",
      headers: { Accept: "application/pdf" }
    })
    assert.equal(unacceptable.response.status, 404)
    assert.match(mainHtml(unacceptable.body), /href="\/sitemap\.xml"/)
  })

  test("404 HTML preserves the route locale and a single main before JavaScript", async () => {
    const titles = {
      "en-US": "Page not found",
      "pt-BR": "Página não encontrada",
      "es-ES": "Página no encontrada"
    }
    for (const [locale, title] of Object.entries(titles)) {
      for (const suffix of ["blog/does-not-exist", "__agent-recovery-404__"]) {
        const pathname = `/${locale}/${suffix}`
        const { response, body } = await fetchText(pathname, {
          redirect: "manual",
          headers: { "x-recovery-locale": locale === "en-US" ? "pt-BR" : "en-US" }
        })
        assert.equal(response.status, 404, pathname)
        assert.match(body, new RegExp(`<html\\b[^>]*lang="${locale}"`), pathname)
        assert.match(mainHtml(body), new RegExp(`<h1\\b[^>]*>${title}</h1>`), pathname)
        assert.match(mainHtml(body), new RegExp(`href="/${locale}"`), pathname)
        assert.equal([...body.matchAll(/<main\b/g)].length, 1, pathname)
      }
    }
  })
}
