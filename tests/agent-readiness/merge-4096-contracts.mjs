import assert from "node:assert/strict"
import { test } from "node:test"

export function register4096Contracts({ fetchText, mainHtml, fetchBinary }) {
  for (const locale of ["en-US", "pt-BR", "es-ES"]) {
    test(`4096 publishes semantic HTML, matching Markdown and discovery in ${locale}`, async () => {
      const path = `/${locale}/games/4096`
      const html = await fetchText(path)
      assert.equal(html.response.status, 200)
      const main = mainHtml(html.body)
      assert.match(main, /<h1\b[^>]*>4096<\/h1>/)
      assert.match(main, /role="grid"/)
      assert.equal((main.match(/role="gridcell"/g) ?? []).length, 16)
      const negotiated = await fetchText(path, { headers: { Accept: "text/markdown" } })
      const explicit = await fetchText(`${path}.md`)
      assert.equal(negotiated.response.status, 200)
      assert.equal(explicit.response.status, 200)
      assert.match(negotiated.response.headers.get("content-type") ?? "", /^text\/markdown/)
      assert.equal(negotiated.body, explicit.body)
      assert.match(explicit.body, /^# 4096\n/)
      for (const term of ["4×4", "4096", "WebAssembly"]) assert.ok(explicit.body.includes(term))
      assert.ok((await fetchText(`/${locale}/games`)).body.includes(`href="${path}"`))
      assert.ok((await fetchText(`/${locale}/games.md`)).body.includes(`](${path})`))
      assert.ok((await fetchText("/sitemap.xml")).body.includes(`https://www.cleisson.com${path}`))
      assert.ok((await fetchText("/llms.txt")).body.includes(`https://www.cleisson.com${path}.md`))
    })
  }

  test("4096 publishes a working dedicated WebAssembly engine", async () => {
    const artifact = await fetchBinary("/games/4096/4096.wasm")
    assert.equal(artifact.response.status, 200)
    assert.match(artifact.response.headers.get("content-type") ?? "", /^application\/wasm/)
    const { instance } = await WebAssembly.instantiate(artifact.bytes)
    assert.equal(instance.exports.game4096_version(), 1)
    assert.equal(instance.exports.game4096_new(42), 1)
    const cells = new Uint32Array(
      instance.exports.memory.buffer,
      instance.exports.game4096_cells_ptr(),
      16
    )
    assert.equal([...cells].filter(Boolean).length, 2)
    assert.equal(instance.exports.game4096_score(), 0)
  })
}
