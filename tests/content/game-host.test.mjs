import assert from "node:assert/strict"
import fs from "node:fs"
import test from "node:test"

import { loadFallingBlocksEngine } from "../../lib/falling-blocks/abi.ts"

const wasm = fs.readFileSync("public/games/falling-blocks/falling-blocks.wasm")

test("the loader can recover after streaming consumes the response", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(wasm))
  t.mock.method(WebAssembly, "instantiateStreaming", async (response) => {
    await response.arrayBuffer()
    throw new TypeError("Streaming unavailable")
  })
  const engine = await loadFallingBlocksEngine("/game.wasm")
  engine.init(1, 2)
  engine.start()
  assert.equal(engine.read().status, 1)
})

test("the host preserves signed piece coordinates from linear memory", async (t) => {
  const result = await WebAssembly.instantiate(wasm)
  t.mock.method(globalThis, "fetch", async () => new Response(wasm))
  t.mock.method(WebAssembly, "instantiateStreaming", async () => result)
  const engine = await loadFallingBlocksEngine("/game.wasm")
  engine.init(1, 2)
  engine.start()
  const exports = result.instance.exports
  const state = new DataView(exports.memory.buffer, exports.blocks_state_ptr(), 32)
  state.setInt8(19, -1)
  state.setInt8(20, -1)
  state.setInt8(23, -1)
  assert.equal(engine.read().pieceX, -1)
  assert.equal(engine.read().pieceY, -1)
  assert.equal(engine.read().ghostRow, -1)
})

test("a failed module request reports the HTTP status", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }))
  await assert.rejects(loadFallingBlocksEngine("/game.wasm"), /503/)
})
