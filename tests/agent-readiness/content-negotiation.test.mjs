import assert from "node:assert/strict"
import test from "node:test"

import { appendNegotiationVary, preferredRepresentation } from "../../lib/content-negotiation.ts"

const cases = [
  [null, "text/html"],
  ["", null],
  ["*/*", "text/html"],
  ["text/markdown", "text/markdown"],
  ["text/markdown, text/html", "text/markdown"],
  ["text/html, text/markdown", "text/html"],
  ["*/*;q=1, text/markdown;q=1", "text/markdown"],
  ["text/*;q=0.8, text/markdown;q=0.8", "text/markdown"],
  ["text/*;q=0.8, text/html;q=0.8", "text/html"],
  ["text/markdown, text/html;q=0.8", "text/markdown"],
  ["text/html, text/markdown;q=0.8", "text/html"],
  ["text/markdown;q=0, text/html", "text/html"],
  ["text/markdown;q=0, */*;q=1", "text/html"],
  ["text/html;q=0, */*;q=1", "text/markdown"],
  ["application/pdf", null]
]

test("Accept negotiation honors quality, specificity, and client order", () => {
  for (const [header, expected] of cases) {
    assert.equal(preferredRepresentation(header), expected, `${header}`)
  }
})

test("negotiated responses append cache variance without discarding existing fields", () => {
  const headers = new Headers({ Vary: "RSC, Accept-Encoding" })
  appendNegotiationVary(headers)

  assert.equal(headers.get("Vary"), "RSC, Accept-Encoding, Accept")
  appendNegotiationVary(headers)
  assert.equal(headers.get("Vary"), "RSC, Accept-Encoding, Accept")
})
