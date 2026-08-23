import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import nextConfig from "../../next.config.mjs"

const config = JSON.parse(readFileSync("vercel.json", "utf8"))
const agentInstructions = readFileSync("AGENTS.md", "utf8")

test("project policy treats agents and AI systems as first-class consumers", () => {
  assert.match(agentInstructions, /agents and AI systems as first-class consumers/i)
  assert.match(agentInstructions, /semantic server-rendered HTML/i)
  assert.match(agentInstructions, /text\/markdown/i)
  assert.match(agentInstructions, /llms\.txt/i)
  assert.match(agentInstructions, /source-linked/i)
  assert.match(agentInstructions, /agent-readiness tests/i)
})

test("production keeps reusable CSS outside the semantic HTML prefix", () => {
  assert.notEqual(
    nextConfig.experimental?.inlineCss,
    true,
    "bounded crawlers should reach the homepage heading hierarchy before large stylesheets"
  )
})

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
