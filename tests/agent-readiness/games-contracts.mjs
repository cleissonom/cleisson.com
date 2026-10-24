import assert from "node:assert/strict"
import { test } from "node:test"

const slug = "falling-blocks"
const locales = ["en-US", "pt-BR", "es-ES"]
const rowRules = {
  "en-US": "Fill all 12 cells in a horizontal row to clear it.",
  "pt-BR": "Preencha todas as 12 células de uma linha horizontal para removê-la.",
  "es-ES": "Llena las 12 celdas de una fila horizontal para eliminarla."
}

export function registerGamesContracts({ fetchText, mainHtml, fetchBinary }) {
  for (const locale of locales) {
    test(`the games index publishes equivalent HTML and Markdown in ${locale}`, async () => {
      const indexPath = `/${locale}/games`
      const html = await fetchText(indexPath)
      assert.equal(html.response.status, 200, indexPath)
      const main = mainHtml(html.body)
      assert.match(main, /<h1\b[^>]*>/)
      assert.ok(main.includes(`href="/${locale}/games/${slug}"`), main)

      const markdown = await fetchText(indexPath, { headers: { Accept: "text/markdown" } })
      const explicit = await fetchText(`${indexPath}.md`)
      for (const result of [markdown, explicit]) {
        assert.equal(result.response.status, 200)
        assert.match(result.response.headers.get("content-type") ?? "", /^text\/markdown/)
      }
      assert.equal(markdown.body, explicit.body)
      assert.ok(markdown.body.includes(`](${indexPath}/${slug})`), markdown.body)
    })

    test(`Falling Blocks publishes equivalent HTML, Markdown and discovery links in ${locale}`, async () => {
      const pathname = `/${locale}/games/${slug}`
      const html = await fetchText(pathname)
      assert.equal(html.response.status, 200, pathname)
      const main = mainHtml(html.body)
      assert.match(main, /<h1\b[^>]*>Falling Blocks<\/h1>/)
      assert.match(
        main,
        /<canvas[^>]*class="falling-blocks-board"/,
        "board canvas is server rendered"
      )
      assert.match(main, /<kbd\b[^>]*>/, "keyboard controls are server rendered")
      const kbdCount = (main.match(/<kbd\b/g) ?? []).length
      assert.ok(kbdCount >= 8, `the controls table lists every key (found ${kbdCount})`)
      for (const localeTag of locales) {
        assert.match(
          html.body,
          new RegExp(
            `<link\\b(?=[^>]*\\brel="alternate")(?=[^>]*\\bhrefLang="${localeTag}")(?=[^>]*\\bhref="https://www\\.cleisson\\.com/${localeTag}/games/${slug}")[^>]*>`,
            "i"
          )
        )
      }

      const markdown = await fetchText(pathname, { headers: { Accept: "text/markdown" } })
      const explicit = await fetchText(`${pathname}.md`)
      for (const result of [markdown, explicit]) {
        assert.equal(result.response.status, 200)
        assert.match(result.response.headers.get("content-type") ?? "", /^text\/markdown/)
        assert.match(result.body, /^# Falling Blocks\n/)
      }
      assert.equal(markdown.body, explicit.body)
      assert.ok(markdown.body.includes("- `"), markdown.body)
      assert.ok(markdown.body.includes("WebAssembly"), markdown.body)
      assert.ok(markdown.body.includes(rowRules[locale]), markdown.body)
      assert.ok(markdown.body.includes("12×20"), markdown.body)
      assert.ok(main.includes(rowRules[locale]), main)

      const index = await fetchText(`/${locale}/games.md`)
      assert.ok(index.body.includes(`](${pathname})`))
      const sitemap = await fetchText("/sitemap.xml")
      assert.ok(sitemap.body.includes(`<loc>https://www.cleisson.com${pathname}</loc>`))
      const instructions = await fetchText("/llms.txt")
      assert.ok(instructions.body.includes(`https://www.cleisson.com${pathname}.md`))
    })
  }

  for (const pathname of [
    "/en-US/games/missing",
    "/en-US/games/missing.md",
    // The pre-review working-tree slug was never published and is not
    // retained as an alias; the removal contract keeps its route down.
    "/en-US/games/tetris"
  ]) {
    test(`unknown game route returns 404: ${pathname}`, async () => {
      const result = await fetchText(pathname)
      assert.equal(result.response.status, 404)
    })
  }

  test("the Falling Blocks WASM artifact is published with a valid module header", async () => {
    const artifact = await fetchBinary("/games/falling-blocks/falling-blocks.wasm")
    assert.equal(artifact.response.status, 200, "/games/falling-blocks/falling-blocks.wasm")
    assert.deepEqual(
      [...artifact.bytes.subarray(0, 4)],
      [0, 0x61, 0x73, 0x6d],
      "\\0asm magic number"
    )
    assert.ok(artifact.bytes.length > 10_000, `compiled module size ${artifact.bytes.length} bytes`)
  })

  test("the games index documents the WASM engine requirement", async () => {
    const markdown = await fetchText("/en-US/games.md")
    assert.ok(markdown.body.includes("WebAssembly"), markdown.body)
    assert.ok(markdown.body.includes("/en-US/games/falling-blocks"), markdown.body)
  })
}
