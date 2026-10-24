import assert from "node:assert/strict"
import test from "node:test"

import {
  loadSudokuProgress,
  saveSudokuProgress,
  readSudokuRecords,
  saveSudokuRecord
} from "../../lib/sudoku/storage.ts"

function mockStorage(t, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value })
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor)
    else delete globalThis.localStorage
  })
}

function storage(t) {
  const entries = new Map()
  mockStorage(t, {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key)
  })
  return entries
}

function progress() {
  const givens = Array.from({ length: 81 }, (_, index) => (index % 3 ? (index % 9) + 1 : 0))
  return {
    version: 1,
    difficulty: 1,
    givens,
    values: [...givens],
    notes: Array(81).fill(0),
    elapsedMs: 12000,
    hintsUsed: 1
  }
}

test("Sudoku progress preserves entries, notes, time and hint use across reload", (t) => {
  storage(t)
  const value = progress()
  value.notes[0] = 5
  value.values[3] = 4
  assert.equal(saveSudokuProgress(value), true)
  assert.deepEqual(loadSudokuProgress(), value)
})

test("malformed, incompatible and out-of-range Sudoku progress is ignored", (t) => {
  const entries = storage(t)
  for (const invalid of [
    "broken JSON",
    JSON.stringify({ ...progress(), version: 2 }),
    JSON.stringify({ ...progress(), difficulty: 3 }),
    JSON.stringify({ ...progress(), values: [1] }),
    JSON.stringify({ ...progress(), notes: Array(81).fill(512) }),
    JSON.stringify({ ...progress(), elapsedMs: -1 }),
    JSON.stringify({ ...progress(), hintsUsed: 0.5 }),
    JSON.stringify({ ...progress(), values: Array(81).fill(0) })
  ]) {
    entries.set("sudoku.progress", invalid)
    assert.equal(loadSudokuProgress(), null, invalid)
  }
})

test("invalid writes cannot overwrite existing Sudoku progress", (t) => {
  storage(t)
  const value = progress()
  assert.equal(saveSudokuProgress(value), true)
  assert.equal(saveSudokuProgress({ ...value, difficulty: -1 }), false)
  assert.deepEqual(loadSudokuProgress(), value)
})

test("best Sudoku times stay separate by difficulty and only improve", (t) => {
  storage(t)
  assert.equal(saveSudokuRecord(0, 60000), 60000)
  assert.equal(saveSudokuRecord(1, 90000), 90000)
  assert.equal(saveSudokuRecord(0, 65000), 60000)
  assert.equal(saveSudokuRecord(0, 55000), 55000)
  assert.deepEqual(readSudokuRecords(), { 0: 55000, 1: 90000 })
})

test("invalid best times are ignored while valid difficulty records survive", (t) => {
  const entries = storage(t)
  entries.set("sudoku.best-times", JSON.stringify({ 0: 0, 1: "123", 2: 50000 }))
  assert.deepEqual(readSudokuRecords(), { 2: 50000 })
  assert.equal(saveSudokuRecord(2, 0), 50000)
  assert.deepEqual(readSudokuRecords(), { 2: 50000 })
})

test("blocked or full storage cannot interrupt Sudoku play", (t) => {
  mockStorage(t, {
    getItem() {
      throw new Error("Blocked")
    },
    setItem() {
      throw new Error("Full")
    },
    removeItem() {
      throw new Error("Blocked")
    }
  })
  assert.equal(loadSudokuProgress(), null)
  assert.equal(saveSudokuProgress(progress()), false)
  assert.deepEqual(readSudokuRecords(), {})
  assert.equal(saveSudokuRecord(1, 90000), 90000)
})

test("a failed record read never overwrites a faster existing time", (t) => {
  let wrote = false
  mockStorage(t, {
    getItem() {
      throw new Error("Blocked read")
    },
    setItem() {
      wrote = true
    }
  })
  assert.equal(saveSudokuRecord(0, 80000), 80000)
  assert.equal(wrote, false)
})

test("a full store still returns the faster existing record", (t) => {
  mockStorage(t, {
    getItem: () => JSON.stringify({ 0: 10000 }),
    setItem() {
      throw new Error("Full")
    }
  })
  assert.equal(saveSudokuRecord(0, 80000), 10000)
})

test("an unreadable saved puzzle is not overwritten with a fresh one", (t) => {
  let wrote = false
  mockStorage(t, {
    getItem() {
      throw new Error("Blocked read")
    },
    setItem() {
      wrote = true
    }
  })
  assert.equal(saveSudokuProgress(progress()), false)
  assert.equal(wrote, false)
})
