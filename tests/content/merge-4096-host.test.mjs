import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { load4096Engine } from "../../lib/merge-4096/abi.ts"

function wasmBytes() {
  return readFileSync("public/games/4096/4096.wasm")
}

async function load(t) {
  const wasm = wasmBytes()
  t.mock.method(
    globalThis,
    "fetch",
    async () => new Response(wasm, { headers: { "Content-Type": "application/wasm" } })
  )
  return load4096Engine("/games/4096/4096.wasm")
}

function tileCount(cells) {
  return cells.filter(Boolean).length
}

test("the host drives a real WASM merge and spawn, then preserves no-op state", async (t) => {
  const engine = await load(t)
  assert.equal(engine.newGame(42), true)

  const initial = engine.read()
  assert.equal(tileCount(initial.cells), 2)
  assert.equal(initial.score, 0)
  assert.equal(initial.moves, 0)
  assert.ok(initial.rng > 0)
  assert.equal(initial.won, false)
  assert.equal(initial.over, false)

  assert.equal(
    engine.restore({ cells: [2, 2, ...Array(14).fill(0)], score: 0, moves: 0, rng: 42 }),
    true
  )
  const beforeMerge = engine.read()
  assert.equal(engine.move(0), true)
  const merged = engine.read()
  assert.equal(merged.cells[0], 4)
  assert.equal(merged.score, 4)
  assert.equal(merged.moves, 1)
  assert.equal(tileCount(merged.cells), 2)
  assert.notEqual(merged.rng, beforeMerge.rng)

  let noOp = false
  let changedMoves = 0
  let previousScore = merged.score
  for (let index = 0; index < 256 && !noOp; index += 1) {
    const before = engine.read()
    const didChange = engine.move(index % 4)
    const after = engine.read()
    if (didChange) {
      changedMoves += 1
      assert.equal(after.moves, before.moves + 1)
      assert.ok(after.score >= previousScore)
      assert.notEqual(after.rng, before.rng, "a valid move should spawn a tile")
      assert.ok(tileCount(after.cells) >= 2)
      previousScore = after.score
    } else {
      noOp = true
      assert.deepEqual(after, before, "an illegal direction leaves the entire state unchanged")
    }
  }
  assert.ok(changedMoves > 0)
  assert.equal(noOp, true)
})

test("engine reads are copies and invalid inputs cannot mutate live state", async (t) => {
  const engine = await load(t)
  assert.equal(engine.newGame(7), true)
  const initial = engine.read()
  const firstTile = initial.cells.find(Boolean)
  initial.cells.fill(0)
  assert.ok(engine.read().cells.includes(firstTile))
  assert.equal(engine.newGame(0), true)
  assert.equal(tileCount(engine.read().cells), 2)

  const before = engine.read()
  for (const seed of [-1, 0.5, 0x1_0000_0000, NaN]) assert.equal(engine.newGame(seed), false)
  for (const direction of [-1, 0.5, 4, NaN]) assert.equal(engine.move(direction), false)
  assert.deepEqual(engine.read(), before)
})

test("valid snapshots restore exactly and invalid restores preserve the active board", async (t) => {
  const engine = await load(t)
  assert.equal(engine.newGame(51), true)
  const saved = engine.read()
  assert.equal(engine.move(0), true)
  assert.equal(engine.restore(saved), true)
  assert.deepEqual(engine.read(), saved)

  const highCounters = {
    ...saved,
    score: Number.MAX_SAFE_INTEGER,
    moves: 0x8000_0001,
    rng: 0x8000_0002
  }
  assert.equal(engine.restore(highCounters), true)
  assert.deepEqual(engine.read(), highCounters, "u32 exports retain their unsigned values")

  const active = engine.read()
  const oneTile = Array(16).fill(0)
  oneTile[active.cells.findIndex(Boolean)] = active.cells.find(Boolean)
  const invalidSnapshots = [
    null,
    { ...saved, cells: saved.cells.slice(1) },
    { ...saved, cells: Array(16).fill(0) },
    { ...saved, cells: Object.assign(Array(16), { 0: 2, 1: 4 }) },
    { ...saved, cells: [3, ...saved.cells.slice(1)] },
    { ...saved, cells: oneTile },
    { ...saved, cells: [0x1_0000_0000, ...saved.cells.slice(1)] },
    { ...saved, score: -1 },
    { ...saved, score: 0.5 },
    { ...saved, score: Number.MAX_SAFE_INTEGER + 1 },
    { ...saved, moves: -1 },
    { ...saved, moves: 0x1_0000_0000 },
    { ...saved, rng: 0 },
    { ...saved, rng: 0x1_0000_0000 }
  ]

  for (const invalid of invalidSnapshots) {
    assert.equal(engine.restore(invalid), false)
    assert.deepEqual(engine.read(), active)
  }

  saved.cells[0] = 0
  assert.deepEqual(engine.read(), active, "mutating caller-owned data does not alter WASM memory")
})

test("engine loading falls back when streaming consumes a cloned response", async (t) => {
  t.mock.method(WebAssembly, "instantiateStreaming", async (response) => {
    await response.arrayBuffer()
    throw new TypeError("Streaming unavailable")
  })
  const engine = await load(t)
  assert.equal(engine.newGame(10), true)
  assert.equal(tileCount(engine.read().cells), 2)
})

test("HTTP failures and aborted engine loads reject without starting a game", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 503 }))
  await assert.rejects(load4096Engine("/games/4096/4096.wasm"), /503/)

  t.mock.method(globalThis, "fetch", async (_, { signal }) => {
    signal.throwIfAborted()
    return new Response(wasmBytes())
  })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(load4096Engine("/games/4096/4096.wasm", controller.signal), {
    name: "AbortError"
  })
})
