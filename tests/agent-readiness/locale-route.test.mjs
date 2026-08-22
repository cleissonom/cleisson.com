import assert from "node:assert/strict"
import test from "node:test"

import { resolveLocaleSwitchPath } from "../../lib/locale-route.ts"

const options = {
  locales: ["en-US", "pt-BR", "es-ES"],
  projectSlugsByLocale: { "pt-BR": ["known-project"] },
  blogSlugsByLocale: { "pt-BR": ["known-post"] }
}

test("locale switching preserves every localized trust route", () => {
  for (const page of ["about", "contact", "privacy"]) {
    assert.equal(resolveLocaleSwitchPath(`/en-US/${page}`, "pt-BR", options), `/pt-BR/${page}`)
  }
})

test("locale switching preserves available detail routes and recovers from missing ones", () => {
  assert.equal(
    resolveLocaleSwitchPath("/en-US/projects/known-project", "pt-BR", options),
    "/pt-BR/projects/known-project"
  )
  assert.equal(resolveLocaleSwitchPath("/en-US/blog/missing", "pt-BR", options), "/pt-BR")
})
