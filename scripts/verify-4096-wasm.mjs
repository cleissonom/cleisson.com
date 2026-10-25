// Exercise the committed WASM ABI against an independent JavaScript game model.
import assert from "node:assert/strict"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const bytes = fs.readFileSync(
  fileURLToPath(new URL("../public/games/4096/4096.wasm", import.meta.url))
)
const { instance } = await WebAssembly.instantiate(bytes)
const api = instance.exports
const MAX_TILE = 2 ** 31
const MAX_SCORE = Number.MAX_SAFE_INTEGER
const EXPORTS = [
  "cells_ptr",
  "input_ptr",
  "move",
  "moves",
  "new",
  "over",
  "restore",
  "rng",
  "score",
  "version",
  "won"
]
  .map((name) => `game4096_${name}`)
  .sort()

function cells(pointer = api.game4096_cells_ptr()) {
  return new Uint32Array(api.memory.buffer, pointer, 16)
}

function read() {
  return {
    cells: [...cells()],
    score: api.game4096_score(),
    moves: api.game4096_moves() >>> 0,
    rng: api.game4096_rng() >>> 0
  }
}

function nextRandom(state) {
  state ^= state << 13
  state ^= state >>> 17
  state ^= state << 5
  return state >>> 0
}

function spawn(state) {
  const empty = state.cells.flatMap((tile, index) => (tile ? [] : [index]))
  if (!empty.length) return
  state.rng = nextRandom(state.rng)
  const index = empty[state.rng % empty.length]
  state.rng = nextRandom(state.rng)
  state.cells[index] = state.rng % 10 === 0 ? 4 : 2
}

function initial(seed) {
  const state = { cells: Array(16).fill(0), score: 0, moves: 0, rng: Math.max(seed >>> 0, 1) }
  spawn(state)
  spawn(state)
  return state
}

function shift(board, direction) {
  const result = Array(16).fill(0)
  let points = 0
  for (let line = 0; line < 4; line += 1) {
    const indices = Array.from({ length: 4 }, (_, offset) => {
      if (direction === 0) return line * 4 + offset
      if (direction === 1) return offset * 4 + line
      if (direction === 2) return line * 4 + 3 - offset
      return (3 - offset) * 4 + line
    })
    const packed = indices.map((index) => board[index]).filter(Boolean)
    const output = []
    for (let offset = 0; offset < packed.length; offset += 1) {
      let tile = packed[offset]
      if (tile < MAX_TILE && tile === packed[offset + 1]) {
        tile *= 2
        points += tile
        offset += 1
      }
      output.push(tile)
    }
    indices.forEach((index, offset) => {
      result[index] = output[offset] || 0
    })
  }
  return { cells: result, points }
}

function move(state, direction) {
  const result = shift(state.cells, direction)
  if (result.cells.every((tile, index) => tile === state.cells[index])) return false
  state.cells = result.cells
  state.score = Math.min(MAX_SCORE, state.score + result.points)
  state.moves = Math.min(0xffff_ffff, state.moves + 1)
  spawn(state)
  return true
}

function over(board) {
  return [0, 1, 2, 3].every((direction) =>
    shift(board, direction).cells.every((tile, index) => tile === board[index])
  )
}

function restore(state) {
  cells(api.game4096_input_ptr()).set(state.cells)
  return api.game4096_restore(state.score, state.moves, state.rng)
}

function reject(state) {
  const before = read()
  assert.equal(restore(state), 0)
  assert.deepEqual(read(), before, "rejected snapshots preserve cells, score, moves and RNG")
}

function verifyMove(state, direction) {
  const changed = move(state, direction)
  assert.equal(api.game4096_move(direction), Number(changed))
  assert.deepEqual(read(), state)
  assert.equal(api.game4096_won(), Number(state.cells.some((tile) => tile >= 4096)))
  assert.equal(api.game4096_over(), Number(over(state.cells)))
}

assert.deepEqual(
  Object.keys(api)
    .filter((name) => name.startsWith("game4096_"))
    .sort(),
  EXPORTS
)
assert.equal(api.game4096_version(), 1)
assert.equal(api.game4096_cells_ptr() % 4, 0)
assert.equal(api.game4096_input_ptr() - api.game4096_cells_ptr(), 64)

let checkedMoves = 0
for (const seed of [0, 1, 2, 42, 104, 123456, 0xffff_ffff]) {
  assert.equal(api.game4096_new(seed), 1)
  const model = initial(seed)
  assert.deepEqual(read(), model)
  assert.equal(model.cells.filter(Boolean).length, 2)
  let navigation = seed || 1234
  for (let step = 0; step < 500; step += 1) {
    navigation = nextRandom(navigation)
    verifyMove(model, navigation % 4)
    checkedMoves += 1
  }
  const before = read()
  assert.equal(api.game4096_move(4), 0)
  assert.deepEqual(read(), before)
}

const base = {
  cells: [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  score: 0,
  moves: 0,
  rng: 42
}
for (const score of [-1, 0.5, NaN, Infinity, -Infinity, MAX_SCORE + 1]) reject({ ...base, score })
for (const tile of [1, 3, 0xffff_ffff])
  reject({ ...base, cells: base.cells.map((value, index) => (index === 0 ? tile : value)) })
reject({ ...base, rng: 0 })
reject({ ...base, cells: Array(16).fill(0) })
reject({ ...base, cells: base.cells.map((value, index) => (index === 1 ? 0 : value)) })

for (const board of [
  [2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 4, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2048, 2048, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [MAX_TILE, MAX_TILE, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]
]) {
  for (let direction = 0; direction < 4; direction += 1) {
    const state = {
      ...base,
      cells: [...board],
      score: MAX_SCORE,
      moves: 0xffff_ffff,
      rng: 0xffff_ffff
    }
    assert.equal(restore(state), 1)
    verifyMove(state, direction)
    const saved = read()
    verifyMove(state, (direction + 1) % 4)
    const future = read()
    assert.equal(restore(saved), 1)
    assert.equal(api.game4096_move((direction + 1) % 4), Number(move(saved, (direction + 1) % 4)))
    assert.deepEqual(read(), future, "restoring RNG replays the same future spawn")
  }
}

console.log(
  `4096.wasm verified: ${bytes.length} bytes, ${EXPORTS.length} game exports, ${checkedMoves} modeled moves`
)
