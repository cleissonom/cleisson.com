import assert from "node:assert/strict"
import { test } from "node:test"

import { getContributions, getContributionsCopy } from "../../data/contributions.ts"
import { formatContentDate } from "../../lib/display-date.ts"

export function registerContributionContracts({ fetchText, mainHtml }) {
  for (const locale of ["en-US", "pt-BR", "es-ES"]) {
    test(`upstream contributions have equivalent, discoverable public sources in ${locale}`, async () => {
      const path = `/${locale}/contributions`
      const canonical = `https://www.cleisson.com${path}`
      const explicit = await fetchText(`${path}.md`)
      assert.equal(explicit.response.status, 200, `${path}.md`)
      const negotiated = await fetchText(path, { headers: { Accept: "text/markdown" } })
      assert.match(negotiated.response.headers.get("content-type") ?? "", /^text\/markdown/)
      assert.equal(negotiated.body, explicit.body)

      const html = await fetchText(path, { headers: { Accept: "text/html" } })
      assert.equal(html.response.status, 200, path)
      assert.ok(html.body.includes(`rel="canonical" href="${canonical}"`))
      assert.ok(html.body.includes(`type="text/markdown" href="${canonical}.md"`))
      const page = mainHtml(html.body)
      const entries = getContributions(locale)
      const collection = [
        ...page.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)
      ]
        .map(([, json]) => JSON.parse(json))
        .find((item) => item["@type"] === "CollectionPage")
      assert.equal(collection?.inLanguage, locale)
      assert.equal(collection.url, canonical)
      assert.deepEqual(
        collection.mainEntity.itemListElement.map((item) => item.url),
        entries.map((entry) => entry.url)
      )
      const copy = getContributionsCopy(locale)
      assert.ok(explicit.body.startsWith(`# ${copy.title}\n`))
      assert.ok(explicit.body.includes(copy.lead))
      for (const contribution of entries) {
        assert.ok(page.includes(`href="${contribution.url}"`))
        assert.ok(explicit.body.includes(`](${contribution.url})`))
        assert.ok(explicit.body.includes(contribution.project))
        assert.ok(explicit.body.includes(contribution.organization))
        const date = formatContentDate(contribution.mergedAt, locale, {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
        assert.ok(explicit.body.includes(`${copy.mergedLabel} ${date}`))
        assert.ok(explicit.body.includes(contribution.title))
        assert.ok(explicit.body.includes(contribution.summary))
        assert.ok(explicit.body.includes(`#${contribution.number}`))
      }
      const sitemap = await fetchText("/sitemap.xml")
      assert.ok(sitemap.body.includes(`<loc>${canonical}</loc>`))
      const instructions = await fetchText("/llms.txt")
      assert.ok(instructions.body.includes(`${canonical}.md`))
      const home = await fetchText(`/${locale}.md`)
      assert.ok(home.body.includes(`](${path})`))
    })
  }
}
