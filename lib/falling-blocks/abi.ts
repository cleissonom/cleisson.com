/**
 * Typed host for the FallingBlocks WASM engine (`wasm/falling-blocks`). Mirrors the ABI
 * documented in `wasm/falling-blocks/src/lib.rs`: game-state mutations refresh
 * the board, state, piece and queue; preview only writes its scratch region.
 * Every read snapshots fresh views over linear memory.
 *
 * Shared block (contiguous inside linear memory; absolute addresses come from
 * the exported pointers at runtime):
 *
 * - board: 144 bytes, row-major 12x12, `0` = empty, `1..=6` = piece id;
 * - state: 32 bytes (`STATE_LAYOUT` below);
 * - piece cells: 16 bytes, active piece matrix (stride 4);
 * - preview: 16 bytes, scratch matrix for stateless `preview(id)`;
 * - queue: 3 bytes, upcoming piece ids.
 */

const COLS = 12
const ROWS = 12

const LAYOUT = {
  boardLen: COLS * ROWS,
  stateLen: 32,
  pieceCellsLen: 16,
  previewLen: 16,
  queueLen: 3
} as const

export const STATE_LAYOUT = {
  score: 0,
  regions: 4,
  level: 8,
  dropTimer: 12,
  status: 16,
  pieceId: 17,
  pieceSize: 18,
  pieceX: 19,
  pieceY: 20,
  held: 21,
  canHold: 22,
  ghostRow: 23
} as const

/** Status byte values, from `engine::Status` in the Rust engine. */
export const FALLING_BLOCKS_STATUS = {
  ready: 0,
  playing: 1,
  paused: 2,
  over: 3
} as const

type FallingBlocksExports = {
  memory: WebAssembly.Memory
  blocks_init(seed_hi: number, seed_lo: number): void
  blocks_start(): void
  blocks_pause(): void
  blocks_tick(delta_ms: number): void
  blocks_move(dx: number): number
  blocks_rotate(direction: number): number
  blocks_soft_drop(): number
  blocks_hard_drop(): number
  blocks_hold(): number
  blocks_ghost_row(): number
  blocks_preview(id: number): number
  blocks_state_ptr(): number
  blocks_board_ptr(): number
  blocks_piece_cells_ptr(): number
  blocks_preview_ptr(): number
  blocks_queue_ptr(): number
}

export type FallingBlocksGameState = {
  score: number
  regions: number
  level: number
  dropTimer: number
  status: number
  pieceId: number
  pieceSize: number
  pieceX: number
  pieceY: number
  held: number
  canHold: boolean
  ghostRow: number
}

export type FallingBlocksRegions = {
  board: Uint8Array
  pieceCells: Uint8Array
  queue: Uint8Array
  preview: Uint8Array
}

export type FallingBlocksEngine = {
  init(seedHi: number, seedLo: number): void
  start(): void
  pause(): void
  tick(deltaMs: number): void
  move(dx: number): boolean
  rotate(direction: number): boolean
  softDrop(): boolean
  hardDrop(): boolean
  hold(): boolean
  ghostRow(): number
  previewSize(id: number): number
  read(): FallingBlocksGameState & FallingBlocksRegions
}

function instantiate(exports: FallingBlocksExports): FallingBlocksEngine {
  let board = 0
  let state = 0
  let pieceCells = 0
  let preview = 0
  let queue = 0

  function resolvePointers() {
    board = exports.blocks_board_ptr()
    state = exports.blocks_state_ptr()
    pieceCells = exports.blocks_piece_cells_ptr()
    preview = exports.blocks_preview_ptr()
    queue = exports.blocks_queue_ptr()
  }

  resolvePointers()

  const view = () => new DataView(exports.memory.buffer)
  const bytes = () => new Uint8Array(exports.memory.buffer)

  const stateView = (memory: Uint8Array) => memory.subarray(state, state + LAYOUT.stateLen)

  function readState(): FallingBlocksGameState {
    const memory = bytes()
    const dataView = view()
    const shared = stateView(memory)
    return {
      score: dataView.getUint32(state + STATE_LAYOUT.score, true),
      regions: dataView.getUint32(state + STATE_LAYOUT.regions, true),
      level: dataView.getUint32(state + STATE_LAYOUT.level, true),
      dropTimer: dataView.getUint32(state + STATE_LAYOUT.dropTimer, true),
      status: shared[STATE_LAYOUT.status],
      pieceId: shared[STATE_LAYOUT.pieceId],
      pieceSize: shared[STATE_LAYOUT.pieceSize],
      pieceX: dataView.getInt8(state + STATE_LAYOUT.pieceX),
      pieceY: dataView.getInt8(state + STATE_LAYOUT.pieceY),
      held: shared[STATE_LAYOUT.held],
      canHold: shared[STATE_LAYOUT.canHold] === 1,
      ghostRow: dataView.getInt8(state + STATE_LAYOUT.ghostRow)
    }
  }

  const engine: FallingBlocksEngine = {
    init(seedHi, seedLo) {
      exports.blocks_init(seedHi, seedLo)
    },
    start() {
      exports.blocks_start()
    },
    pause() {
      exports.blocks_pause()
    },
    tick(deltaMs) {
      exports.blocks_tick(deltaMs)
    },
    move(dx) {
      return exports.blocks_move(dx) !== 0
    },
    rotate(direction) {
      return exports.blocks_rotate(direction) !== 0
    },
    softDrop() {
      return exports.blocks_soft_drop() !== 0
    },
    hardDrop() {
      return exports.blocks_hard_drop() !== 0
    },
    hold() {
      return exports.blocks_hold() !== 0
    },
    ghostRow() {
      return exports.blocks_ghost_row()
    },
    previewSize(id) {
      return exports.blocks_preview(id)
    },
    read(): FallingBlocksGameState & FallingBlocksRegions {
      const memory = bytes()
      return {
        ...readState(),
        board: memory.slice(board, board + LAYOUT.boardLen),
        pieceCells: memory.slice(pieceCells, pieceCells + LAYOUT.pieceCellsLen),
        queue: memory.slice(queue, queue + LAYOUT.queueLen),
        preview: memory.slice(preview, preview + LAYOUT.previewLen)
      }
    }
  }

  return engine
}

/**
 * Loads and instantiates the compiled engine. Falls back from streaming
 * instantiation so cached resources without content-type support still work.
 */
export async function loadFallingBlocksEngine(
  wasmPath: string,
  signal?: AbortSignal
): Promise<FallingBlocksEngine> {
  const source = await fetch(wasmPath, { signal })
  if (!source.ok) {
    throw new Error(`FallingBlocks WASM module request failed: ${source.status}`)
  }

  try {
    const { instance } = await WebAssembly.instantiateStreaming(source.clone())
    return instantiate(instance.exports as FallingBlocksExports)
  } catch {
    const bytes = await source.arrayBuffer()
    const { instance } = await WebAssembly.instantiate(bytes)
    return instantiate(instance.exports as FallingBlocksExports)
  }
}

export { COLS, ROWS }
