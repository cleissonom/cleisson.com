import assert from "node:assert/strict"
import test from "node:test"

import {
  load4096Progress,
  read4096Best,
  save4096Best,
  save4096Progress
} from "../../lib/merge-4096/storage.ts"

const PROGRESS_KEY = "4096.progress"
const BEST_KEY = "4096.best-score"
const MAX_U32 = 0xffffffff
const MAX_TILE = 2 ** 31

function snapshot(overrides = {}) {
  return {
    cells: [2, 4, ...Array(14).fill(0)],
    score: 12,
    moves: 3,
    rng: 42,
    ...overrides
  }
}

function progress(overrides = {}) {
  return {
    version: 1,
    snapshot: snapshot(),
    continued: false,
    ...overrides
  }
}

function installStorage(t, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor)
    else delete globalThis.localStorage
  })
}

function storage(t) {
  const entries = new Map()
  installStorage(t, {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  })
  return entries
}

test("4096 progress round-trips snapshots and continued wins", (t) => {
  const entries = storage(t)
  const saved = progress({
    snapshot: snapshot({
      cells: [MAX_TILE, 2, ...Array(14).fill(0)],
      score: Number.MAX_SAFE_INTEGER,
      moves: MAX_U32,
      rng: MAX_U32
    }),
    continued: true
  })

  assert.equal(save4096Progress(saved), true)
  assert.deepEqual(load4096Progress(), saved)
  assert.equal(entries.has(BEST_KEY), false)
})

test("malformed or unsupported 4096 progress is ignored", (t) => {
  const entries = storage(t)
  const valid = progress()
  const invalid = [
    "not JSON",
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, version: "1" }),
    JSON.stringify({ ...valid, continued: "yes" }),
    JSON.stringify({ ...valid, continued: true }),
    JSON.stringify({ ...valid, snapshot: snapshot({ cells: Array(15).fill(0) }) }),
    JSON.stringify({ ...valid, snapshot: snapshot({ cells: Array(16).fill(0) }) }),
    JSON.stringify({
      ...valid,
      snapshot: snapshot({ cells: Object.assign(Array(16), { 0: 2, 1: 4 }) })
    }),
    ...[1, 3, -2, 1.5, MAX_TILE * 2].map((tile) => {
      const cells = [...valid.snapshot.cells]
      cells[0] = tile
      return JSON.stringify({ ...valid, snapshot: snapshot({ cells }) })
    }),
    ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1].map((score) =>
      JSON.stringify({ ...valid, snapshot: snapshot({ score }) })
    ),
    ...[-1, 1.5, MAX_U32 + 1].map((moves) =>
      JSON.stringify({ ...valid, snapshot: snapshot({ moves }) })
    ),
    ...[0, -1, 1.5, MAX_U32 + 1].map((rng) =>
      JSON.stringify({ ...valid, snapshot: snapshot({ rng }) })
    )
  ]

  for (const value of invalid) {
    entries.set(PROGRESS_KEY, value)
    assert.equal(load4096Progress(), null, value)
  }
})

test("invalid progress cannot overwrite an existing saved board", (t) => {
  const entries = storage(t)
  const saved = progress()
  assert.equal(save4096Progress(saved), true)
  const original = entries.get(PROGRESS_KEY)
  const invalid = progress({ snapshot: snapshot({ cells: [2, ...Array(15).fill(0)] }) })
  const sparseCells = Object.assign(Array(16), { 0: 2, 1: 4 })

  assert.equal(save4096Progress(invalid), false)
  assert.equal(save4096Progress(progress({ snapshot: snapshot({ cells: sparseCells }) })), false)
  assert.equal(entries.get(PROGRESS_KEY), original)
})

test("best scores are monotonic and use storage separate from progress", (t) => {
  const entries = storage(t)
  const saved = progress()

  assert.equal(save4096Progress(saved), true)
  assert.equal(save4096Best(100), 100)
  assert.equal(save4096Best(80), 100)
  assert.equal(save4096Best(200), 200)
  assert.equal(read4096Best(), 200)
  assert.deepEqual([...entries.keys()].sort(), [BEST_KEY, PROGRESS_KEY])
  assert.deepEqual(JSON.parse(entries.get(PROGRESS_KEY)), saved)
  assert.equal(save4096Best(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER)
  assert.equal(read4096Best(), Number.MAX_SAFE_INTEGER)
})

test("invalid or unsafe best scores are ignored", (t) => {
  const entries = storage(t)
  entries.set(BEST_KEY, "400")

  for (const raw of ["", "-1", "1.5", "NaN", "Infinity", "9007199254740992", "broken"]) {
    entries.set(BEST_KEY, raw)
    assert.equal(read4096Best(), 0, raw)
  }

  entries.set(BEST_KEY, "400")
  for (const score of [-1, 1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity]) {
    assert.equal(save4096Best(score), 400, String(score))
  }
  assert.equal(entries.get(BEST_KEY), "400")
})

test("valid zero and corrupt best records can recover", (t) => {
  const entries = storage(t)
  entries.set(BEST_KEY, "0")
  assert.equal(save4096Best(50), 50)
  assert.equal(entries.get(BEST_KEY), "50")

  entries.set(BEST_KEY, "corrupt")
  assert.equal(read4096Best(), 0)
  assert.equal(save4096Best(100), 100)
  assert.equal(entries.get(BEST_KEY), "100")
})

test("blocked storage never interrupts callers or overwrites unreadable data", (t) => {
  let wrote = false
  installStorage(t, {
    getItem() {
      throw new DOMException("Blocked", "SecurityError")
    },
    setItem() {
      wrote = true
      throw new DOMException("Full", "QuotaExceededError")
    }
  })

  assert.equal(load4096Progress(), null)
  assert.equal(save4096Progress(progress()), false)
  assert.equal(read4096Best(), 0)
  assert.equal(save4096Best(500), 500)
  assert.equal(wrote, false)
})

test("a blocked best-score write preserves the previous record", (t) => {
  const entries = new Map([[BEST_KEY, "300"]])
  installStorage(t, {
    getItem: (key) => entries.get(key) ?? null,
    setItem() {
      throw new DOMException("Full", "QuotaExceededError")
    }
  })

  assert.equal(save4096Best(250), 300)
  assert.equal(save4096Best(500), 500)
  assert.equal(entries.get(BEST_KEY), "300")
  assert.equal(read4096Best(), 300)
})

test("a blocked progress write returns false without replacing the stored board", (t) => {
  const original = JSON.stringify(progress())
  installStorage(t, {
    getItem: () => original,
    setItem() {
      throw new DOMException("Full", "QuotaExceededError")
    }
  })

  assert.equal(save4096Progress(progress({ continued: true })), false)
  assert.equal(load4096Progress().continued, false)
})
