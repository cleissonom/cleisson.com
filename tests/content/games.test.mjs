// Static publication contracts for the games section without running the
// site: the committed WASM artifact stays loadable, the build tooling stays
// wired, and every locale's game page stays discoverable in llms.txt.

import assert from "node:assert/strict"
import fs from "node:fs"
import { spawnSync } from "node:child_process"
import path from "node:path"
import test from "node:test"

const root = process.cwd()
const artifactPath = path.join(root, "public", "games", "falling-blocks", "falling-blocks.wasm")
const locales = ["en-US", "pt-BR", "es-ES"]

test("the Falling Blocks WASM artifact passes the ABI verifier", () => {
  assert.ok(
    fs.existsSync(artifactPath),
    "public/games/falling-blocks/falling-blocks.wasm should exist"
  )
  const bytes = fs.readFileSync(artifactPath)
  assert.deepEqual([...bytes.subarray(0, 4)], [0, 0x61, 0x73, 0x6d], "\\0asm magic number")
  assert.ok(bytes.length < 64 * 1024, `game module should remain under 64 KiB: ${bytes.length}`)

  const verifier = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "verify-falling-blocks-wasm.mjs")],
    {
      encoding: "utf8"
    }
  )
  assert.equal(verifier.status, 0, verifier.stderr || verifier.stdout)
})

test("llms.txt links every localized games page", () => {
  const instructions = fs.readFileSync(path.join(root, "public", "llms.txt"), "utf8")
  for (const locale of locales) {
    assert.ok(instructions.includes(`/${locale}/games.md`), `games index for ${locale}`)
    assert.ok(
      instructions.includes(`/${locale}/games/falling-blocks.md`),
      `falling-blocks page for ${locale}`
    )
  }
})
