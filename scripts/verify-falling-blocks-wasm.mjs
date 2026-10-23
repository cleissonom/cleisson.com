// Verifies the committed FallingBlocks WASM artifact directly in Node: the exported
// symbol set, the documented memory layout (resolved through the exported
// region pointers), and a short game flow executed through the ABI. The build
// script and CI can run it without a browser.
//
// Region pointers are linker-dependent absolute addresses, so nothing here
// hardcodes them: offsets inside the shared block are asserted from the
// pointer deltas, and all reads go through those resolved addresses.

import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const artifact = path.join(repoRoot, "public", "games", "falling-blocks", "falling-blocks.wasm")
const bytes = fs.readFileSync(artifact)

const STATUS = { ready: 0, playing: 1, paused: 2, over: 3 }

// Documented layout from wasm/falling-blocks/src/lib.rs, relative to the block base:
// board, state, piece cells, preview, queue.
const OFFSETS = {
  board: 0,
  boardLen: 144,
  state: 144,
  stateLen: 32,
  pieceCells: 176,
  pieceCellsLen: 16,
  preview: 192,
  previewLen: 16,
  queue: 208,
  queueLen: 3
}

const EXPECTED_EXPORTS = [
  "blocks_board_ptr",
  "blocks_ghost_row",
  "blocks_hard_drop",
  "blocks_hold",
  "blocks_init",
  "blocks_move",
  "blocks_pause",
  "blocks_piece_cells_ptr",
  "blocks_preview",
  "blocks_preview_ptr",
  "blocks_queue_ptr",
  "blocks_rotate",
  "blocks_soft_drop",
  "blocks_start",
  "blocks_state_ptr",
  "blocks_tick"
]

let instance
let base // absolute board pointer, resolved once the instance is live

function memory() {
  return new Uint8Array(instance.exports.memory.buffer)
}

function region(name) {
  return memory().slice(base + OFFSETS[name], base + OFFSETS[name] + OFFSETS[`${name}Len`])
}

function score() {
  const view = new DataView(instance.exports.memory.buffer, base + OFFSETS.state, OFFSETS.stateLen)
  return view.getUint32(0, true)
}

function state() {
  return memory().slice(base + OFFSETS.state, base + OFFSETS.state + OFFSETS.stateLen)
}

function status() {
  return state()[16]
}

function piece() {
  const value = state()
  return {
    id: value[17],
    size: value[18],
    x: value[19] > 127 ? value[19] - 256 : value[19],
    y: value[20] > 127 ? value[20] - 256 : value[20]
  }
}

function filledBoardCells() {
  let filled = 0
  for (const cell of region("board")) if (cell !== 0) filled += 1
  return filled
}

async function main() {
  const instantiation = await WebAssembly.instantiate(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  )
  instance = instantiation.instance
  const { exports } = instance
  const titles = Object.keys(exports)
    .filter((name) => name.startsWith("blocks_"))
    .sort()

  for (const expected of EXPECTED_EXPORTS) {
    assert.ok(titles.includes(expected), `missing export ${expected}`)
  }

  // Linker-dependent base plus a contiguous, documented block layout.
  base = exports.blocks_board_ptr()
  assert.ok(base > 0, "the board region resolves inside linear memory")
  assert.equal(exports.blocks_state_ptr() - base, OFFSETS.state - OFFSETS.board)
  assert.equal(exports.blocks_piece_cells_ptr() - base, OFFSETS.pieceCells - OFFSETS.board)
  assert.equal(exports.blocks_preview_ptr() - base, OFFSETS.preview - OFFSETS.board)
  assert.equal(exports.blocks_queue_ptr() - base, OFFSETS.queue - OFFSETS.board)

  exports.blocks_init(0xdead, 0xbeef)
  assert.equal(status(), STATUS.ready)
  assert.equal(filledBoardCells(), 0)
  assert.ok(
    region("queue").every((id) => id >= 1 && id <= 6),
    "the ready queue is dealt"
  )

  const first = region("queue")[0]
  exports.blocks_start()
  assert.equal(status(), STATUS.playing)
  assert.equal(piece().id, first, "start uses the ready preview")
  assert.equal(exports.blocks_move(256), 0)
  assert.equal(exports.blocks_rotate(256), 0)
  assert.ok(piece().id >= 1 && piece().id <= 6)

  assert.equal(exports.blocks_move(-32), 0, "walls stop the piece")
  exports.blocks_rotate(1)
  exports.blocks_soft_drop()
  assert.equal(score(), 1, "soft drop scores a point")

  const activeCount = region("pieceCells").filter((cell) => cell !== 0).length
  exports.blocks_hard_drop()
  assert.ok(score() > 1, "hard drop scores distance points")
  assert.ok(filledBoardCells() === activeCount, "the active piece locked once")

  exports.blocks_pause()
  assert.equal(status(), STATUS.paused)
  const pausedBoard = region("board")
  const pausedScore = score()
  assert.equal(exports.blocks_hard_drop(), 0)
  assert.deepEqual(region("board"), pausedBoard)
  assert.equal(score(), pausedScore)
  exports.blocks_pause()
  assert.equal(status(), STATUS.playing)

  exports.blocks_init(0, 3)
  assert.equal(status(), STATUS.ready, "init resets the run")
  assert.equal(score(), 0, "init resets the score")

  assert.equal(exports.blocks_preview(1), 1, "seed occupies one cell")
  assert.deepEqual([...region("preview")], [1, ...Array(15).fill(0)])
  assert.equal(exports.blocks_preview(2), 2, "domino spans 2 columns")
  assert.equal(exports.blocks_preview(0), 0, "unknown ids have no shape")
  assert.ok(exports.blocks_ghost_row() >= 0 && exports.blocks_ghost_row() < 12)

  exports.blocks_start()
  assert.equal(status(), STATUS.playing, "a run restarts cleanly")
  const activeCells = memory().slice(
    exports.blocks_piece_cells_ptr(),
    exports.blocks_piece_cells_ptr() + OFFSETS.pieceCellsLen
  )
  assert.equal(
    activeCells.reduce((filled, cell) => filled + (cell !== 0 ? 1 : 0), 0),
    [0, 1, 2, 3, 3, 4, 5][piece().id],
    "a fresh piece matches its shape"
  )

  console.log(`falling-blocks.wasm verified: ${bytes.length} bytes, ${titles.length} game exports`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
