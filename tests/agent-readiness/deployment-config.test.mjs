import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const config = JSON.parse(readFileSync("vercel.json", "utf8"))

test("Vercel appends negotiation tokens to the final response Vary header", () => {
  const route = config.routes?.find(
    (candidate) =>
      candidate.continue === true &&
      candidate.transforms?.some(
        (transform) =>
          transform.type === "response.headers" &&
          transform.op === "append" &&
          transform.target?.key === "Vary" &&
          transform.args?.includes("Accept") &&
          transform.args?.includes("Accept-Encoding")
      )
  )

  assert.ok(route, "Vercel should append Accept after Next.js finalizes its Vary header")
  const matcher = new RegExp(route.src)
  for (const pathname of ["/", "/en-US", "/en-US/about", "/missing/path"]) {
    assert.ok(matcher.test(pathname), `${pathname} should receive final negotiation variance`)
  }
  for (const pathname of [
    "/_next/app.js",
    "/_vercel/insights",
    "/api/markdown/en-US",
    "/rss.xml"
  ]) {
    assert.equal(matcher.test(pathname), false, `${pathname} should retain its own cache behavior`)
  }
})
