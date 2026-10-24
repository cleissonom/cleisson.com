import assert from "node:assert/strict"
import { test } from "node:test"

export function registerSudokuContracts({ fetchText, mainHtml, fetchBinary }) {
  for (const locale of ["en-US", "pt-BR", "es-ES"]) {
    test(`Sudoku publishes playable HTML, equivalent Markdown and discovery in ${locale}`, async () => {
      const path = `/${locale}/games/sudoku`
      const html = await fetchText(path)
      assert.equal(html.response.status, 200)
      const main = mainHtml(html.body)
      assert.match(main, /<h1\b[^>]*>Sudoku<\/h1>/)
      assert.match(main, /role="grid"/)
      assert.equal((main.match(/role="gridcell"/g) ?? []).length, 81)
      const markdown = await fetchText(path, { headers: { Accept: "text/markdown" } })
      const explicit = await fetchText(`${path}.md`)
      assert.equal(markdown.response.status, 200)
      assert.equal(explicit.response.status, 200)
      assert.match(markdown.response.headers.get("content-type") ?? "", /^text\/markdown/)
      assert.equal(markdown.body, explicit.body)
      assert.match(markdown.body, /^# Sudoku\n/)
      assert.ok(markdown.body.includes("9×9"))
      assert.ok(markdown.body.includes("3×3"))
      assert.ok(markdown.body.includes("WebAssembly"))
      assert.ok((await fetchText(`/${locale}/games`)).body.includes(`href="${path}"`))
      assert.ok((await fetchText(`/${locale}/games.md`)).body.includes(`](${path})`))
      assert.ok((await fetchText("/sitemap.xml")).body.includes(`https://www.cleisson.com${path}`))
      assert.ok((await fetchText("/llms.txt")).body.includes(`https://www.cleisson.com${path}.md`))
    })
  }

  test("the Sudoku WASM engine is published separately from Falling Blocks", async () => {
    const artifact = await fetchBinary("/games/sudoku/sudoku.wasm")
    assert.equal(artifact.response.status, 200)
    assert.match(artifact.response.headers.get("content-type") ?? "", /^application\/wasm/)
    const { instance } = await WebAssembly.instantiate(artifact.bytes)
    assert.equal(instance.exports.sudoku_version(), 1)
    assert.equal(instance.exports.sudoku_generate(42, 0), 1)
  })
}
