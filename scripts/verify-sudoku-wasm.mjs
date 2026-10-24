// Verify the committed artifact through its public ABI, including an independent
// bounded solution count, mutable inputs, hints, and rejected snapshot imports.
import assert from "node:assert/strict"
import fs from "node:fs"
import { performance } from "node:perf_hooks"
import { fileURLToPath } from "node:url"

const bytes = fs.readFileSync(
  fileURLToPath(new URL("../public/games/sudoku/sudoku.wasm", import.meta.url))
)
const { instance } = await WebAssembly.instantiate(bytes)
const api = instance.exports
const CELLS = 81
const EXPECTED_EXPORTS = [
  "sudoku_candidates",
  "sudoku_complete",
  "sudoku_conflicts_ptr",
  "sudoku_generate",
  "sudoku_givens_ptr",
  "sudoku_hint",
  "sudoku_hint_ptr",
  "sudoku_input_ptr",
  "sudoku_restore",
  "sudoku_set",
  "sudoku_values_ptr",
  "sudoku_version"
]

function region(name, length = CELLS) {
  return new Uint8Array(api.memory.buffer, api[`sudoku_${name}_ptr`](), length)
}

function box(index) {
  return Math.floor(index / 27) * 3 + Math.floor((index % 9) / 3)
}

function peers(first, second) {
  return (
    Math.floor(first / 9) === Math.floor(second / 9) ||
    first % 9 === second % 9 ||
    box(first) === box(second)
  )
}

function candidates(grid, index) {
  if (grid[index]) return []
  const occupied = new Set(grid.filter((_, other) => peers(index, other)))
  return Array.from({ length: 9 }, (_, digit) => digit + 1).filter((digit) => !occupied.has(digit))
}

function solve(grid) {
  const working = [...grid]
  let count = 0
  let first
  let nodes = 0
  function search() {
    assert.ok(nodes++ < 100_000, "independent uniqueness search stays bounded")
    let index = -1
    let possible = Array(10)
    for (let cell = 0; cell < CELLS; cell += 1) {
      if (working[cell]) continue
      const options = candidates(working, cell)
      if (!options.length) return
      if (options.length < possible.length) {
        index = cell
        possible = options
        if (options.length === 1) break
      }
    }
    if (index < 0) {
      first ??= [...working]
      count += 1
      return
    }
    for (const digit of possible) {
      working[index] = digit
      search()
      if (count === 2) break
    }
    working[index] = 0
  }
  search()
  return { count, first }
}

function importPuzzle(givens, values = givens) {
  region("input", CELLS * 2).set([...givens, ...values])
  return api.sudoku_restore()
}

function assertRejected(givens, values = givens) {
  const before = [
    ...region("givens"),
    ...region("values"),
    ...region("conflicts"),
    ...region("hint", 4)
  ]
  assert.equal(importPuzzle(givens, values), 0)
  assert.deepEqual(
    [...region("givens"), ...region("values"), ...region("conflicts"), ...region("hint", 4)],
    before,
    "a rejected import preserves the current game"
  )
}

function verifyHints(givens, solution) {
  assert.equal(importPuzzle(givens), 1)
  const empty = givens.findIndex((digit) => digit === 0)
  const wrong = solution[empty] === 9 ? 1 : solution[empty] + 1
  assert.equal(api.sudoku_set(empty, wrong), 1)
  assert.equal(api.sudoku_hint(), 5)
  assert.deepEqual([...region("hint", 4)], [5, empty, 0, 0])
  assert.equal(api.sudoku_set(empty, 0), 1)
  for (let step = 0; step < CELLS && !api.sudoku_complete(); step += 1) {
    const kind = api.sudoku_hint()
    const [storedKind, index, value, unit] = region("hint", 4)
    assert.equal(storedKind, kind)
    assert.ok(kind >= 1 && kind <= 6 && kind !== 5)
    assert.equal(region("values")[index], 0)
    assert.equal(value, solution[index], "every offered hint agrees with the unique solution")
    if (kind === 1) assert.deepEqual(candidates([...region("values")], index), [value])
    if (kind >= 2 && kind <= 4) assert.ok(unit < 9)
    assert.equal(api.sudoku_set(index, value), 1)
  }
  assert.equal(api.sudoku_complete(), 1)
  assert.equal(api.sudoku_hint(), 0)
  assert.deepEqual([...region("values")], solution)
}

assert.equal(api.sudoku_version(), 1)
assert.deepEqual(
  Object.keys(api)
    .filter((name) => name.startsWith("sudoku_"))
    .sort(),
  EXPECTED_EXPORTS
)
const base = api.sudoku_givens_ptr()
for (const [name, offset] of [
  ["values", 81],
  ["conflicts", 162],
  ["hint", 243],
  ["input", 247]
]) {
  assert.equal(api[`sudoku_${name}_ptr`]() - base, offset)
}
assert.equal(api.sudoku_complete(), 0)
assert.equal(api.sudoku_set(0, 1), 0, "no edits before a puzzle exists")

const timings = []
let sample
for (const seed of [0, 1, 42, 104, 0xffff_ffff]) {
  for (const [difficulty, target] of [42, 35, 29].entries()) {
    const start = performance.now()
    assert.equal(api.sudoku_generate(seed, difficulty), 1)
    timings.push(performance.now() - start)
    const givens = [...region("givens")]
    assert.equal(givens.filter(Boolean).length, target)
    assert.deepEqual([...region("values")], givens)
    assert.ok(region("conflicts").every((flag) => flag === 0))
    const solved = solve(givens)
    assert.equal(solved.count, 1, `unique seed ${seed}, difficulty ${difficulty}`)
    sample = { givens, solution: solved.first }
  }
}

const { givens, solution } = sample
const before = [...region("values")]
assert.equal(api.sudoku_generate(42, 3), 0)
assert.deepEqual([...region("values")], before)
const fixed = givens.findIndex(Boolean)
assert.equal(api.sudoku_set(fixed, 0), 0)
assert.equal(api.sudoku_set(81, 1), 0)
assert.equal(api.sudoku_set(0, 256), 0, "large ABI inputs cannot truncate to legal digits")
assert.equal(api.sudoku_candidates(81), 0)
for (let index = 0; index < CELLS; index += 1) {
  const mask = candidates(givens, index).reduce((bits, digit) => bits | (1 << (digit - 1)), 0)
  assert.equal(api.sudoku_candidates(index), mask)
}

const editable = givens.findIndex((digit) => digit === 0)
const peer = givens.findIndex((digit, index) => digit && peers(index, editable))
assert.equal(api.sudoku_set(editable, givens[peer]), 1)
assert.equal(region("conflicts")[editable], 1)
assert.equal(region("conflicts")[peer], 1)
assert.equal(api.sudoku_set(editable, 0), 1)
assert.ok(region("conflicts").every((flag) => flag === 0))

assertRejected(Array(CELLS).fill(0))
assertRejected(
  givens,
  givens.map((digit, index) => (index === editable ? 10 : digit))
)
assertRejected(
  givens,
  givens.map((digit, index) => (index === fixed ? 0 : digit))
)
assertRejected(givens.map((digit, index) => (index === fixed ? 10 : digit)))
assertRejected(solution.map((digit, index) => (index < 27 ? digit : 0)))
verifyHints(givens, solution)

const average = timings.reduce((total, elapsed) => total + elapsed, 0) / timings.length
console.log(
  `sudoku.wasm verified: ${bytes.length} bytes, ${EXPECTED_EXPORTS.length} game exports, ` +
    `${timings.length} unique puzzles; generation mean ${average.toFixed(2)}ms, max ${Math.max(...timings).toFixed(2)}ms`
)
