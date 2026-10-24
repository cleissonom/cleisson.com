import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"

import { readBestScore, saveBestScore } from "../../lib/falling-blocks/best-score.ts"

const key = "falling-blocks.best-score"
const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
let values

beforeEach(() => {
  values = new Map()
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (name) => values.get(name) ?? null,
      setItem: (name, value) => values.set(name, value)
    }
  })
})

afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor)
  else delete globalThis.localStorage
})

test("missing or corrupt records are ignored", () => {
  for (const value of [null, "", "broken", "-1", "1.5", "Infinity", "4294967296"]) {
    if (value === null) values.delete(key)
    else values.set(key, value)
    assert.equal(readBestScore(), 0, String(value))
  }
  values.set(key, "4294967295")
  assert.equal(readBestScore(), 4294967295)
})

test("only a new personal best replaces the saved record", () => {
  assert.equal(saveBestScore(42), 42)
  assert.equal(readBestScore(), 42)
  assert.equal(saveBestScore(10), 42)
  assert.equal(saveBestScore(42), 42)
  assert.equal(readBestScore(), 42)
  assert.equal(saveBestScore(84), 84)
  assert.equal(readBestScore(), 84)
})

test("a record from another tab is preserved", () => {
  saveBestScore(42)
  values.set(key, "1000")
  assert.equal(saveBestScore(84), 1000)
  assert.equal(readBestScore(), 1000)
})

test("unavailable storage leaves an in-memory score without throwing", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Blocked", "SecurityError")
    }
  })
  assert.equal(readBestScore(), 0)
  assert.equal(saveBestScore(42), 42)
})

test("a failed read cannot overwrite an existing record", () => {
  values.set(key, "1000")
  localStorage.getItem = () => {
    throw new DOMException("Blocked", "SecurityError")
  }
  assert.equal(saveBestScore(42), 42)
  assert.equal(values.get(key), "1000")
})

test("full storage still allows an in-memory record", () => {
  localStorage.setItem = () => {
    throw new DOMException("Full", "QuotaExceededError")
  }
  assert.equal(saveBestScore(42), 42)
  assert.equal(readBestScore(), 0)
})
