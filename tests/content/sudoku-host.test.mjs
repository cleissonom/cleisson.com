import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { loadSudokuEngine } from "../../lib/sudoku/abi.ts"

const wasm = readFileSync("public/games/sudoku/sudoku.wasm")

async function load(t) {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(wasm, {
        headers: { "Content-Type": "application/wasm" }
      })
  )
  return loadSudokuEngine("/games/sudoku/sudoku.wasm")
}

test("the Sudoku host drives a real puzzle through hints to a valid completed grid", async (t) => {
  const engine = await load(t)
  assert.equal(engine.generate(42, 0), true)
  const initial = engine.read()
  assert.equal(initial.givens.filter(Boolean).length, 42)
  assert.equal(engine.complete(), false)
  const given = initial.givens.findIndex(Boolean)
  assert.equal(engine.set(given, 0), false)
  for (let step = 0; step < 81 && !engine.complete(); step++) {
    const hint = engine.hint()
    assert.ok(hint)
    assert.equal(engine.set(hint.index, hint.value), true)
  }
  assert.equal(engine.complete(), true)
  assert.equal(engine.hint(), null)
  const final = engine.read()
  assert.equal(final.conflicts.some(Boolean), false)
  for (let index = 0; index < 9; index++) {
    const row = final.values.slice(index * 9, index * 9 + 9)
    const column = Array.from({ length: 9 }, (_, r) => final.values[r * 9 + index])
    const box = Array.from(
      { length: 9 },
      (_, offset) =>
        final.values[
          (Math.floor(index / 3) * 3 + Math.floor(offset / 3)) * 9 + (index % 3) * 3 + (offset % 3)
        ]
    )
    for (const unit of [row, column, box])
      assert.deepEqual([...unit].sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  }
})

test("Sudoku restore preserves user entries and rejects invalid boards atomically", async (t) => {
  const original = await load(t)
  original.generate(51, 2)
  const initial = original.read()
  const empty = initial.givens.findIndex((digit) => !digit)
  const allowed = original.candidates(empty)
  assert.ok(allowed.length)
  original.set(empty, allowed[0])
  const saved = original.read()
  const resumed = await load(t)
  assert.equal(resumed.restore(saved.givens, saved.values), true)
  assert.deepEqual(resumed.read(), saved)
  assert.equal(resumed.restore(Array(81).fill(0), Array(81).fill(0)), false)
  assert.deepEqual(resumed.read(), saved)
  assert.equal(resumed.restore(saved.givens, Array(81).fill(99)), false)
  saved.values.fill(9)
  assert.notDeepEqual(resumed.read().values, saved.values, "reads return independent snapshots")
})

test("Sudoku engine loading falls back if streaming consumed its response", async (t) => {
  t.mock.method(WebAssembly, "instantiateStreaming", async (response) => {
    await response.arrayBuffer()
    throw new TypeError("Streaming unavailable")
  })
  const engine = await load(t)
  assert.equal(engine.generate(7, 1), true)
  assert.equal(engine.read().givens.filter(Boolean).length, 35)
})

test("Sudoku load reports HTTP errors and honors an aborted request", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }))
  await assert.rejects(loadSudokuEngine("/game.wasm"), /503/)
  t.mock.method(globalThis, "fetch", async (_, { signal }) => {
    signal.throwIfAborted()
    return new Response(wasm)
  })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(loadSudokuEngine("/game.wasm", controller.signal), { name: "AbortError" })
})
