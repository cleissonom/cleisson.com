const CELL_COUNT = 16
const MAX_U32 = 0xffff_ffff
const MAX_TILE = 0x8000_0000

export type Direction = 0 | 1 | 2 | 3
export type MergeSnapshot = { cells: number[]; score: number; moves: number; rng: number }
export type MergeBoard = MergeSnapshot & { won: boolean; over: boolean }

export type MergeEngine = {
  newGame(seed: number): boolean
  move(direction: Direction): boolean
  read(): MergeBoard
  restore(snapshot: MergeSnapshot): boolean
}

type Merge4096Exports = {
  memory: WebAssembly.Memory
  game4096_version(): number
  game4096_new(seed: number): number
  game4096_cells_ptr(): number
  game4096_move(direction: number): number
  game4096_score(): number
  game4096_moves(): number
  game4096_rng(): number
  game4096_won(): number
  game4096_over(): number
  game4096_input_ptr(): number
  game4096_restore(score: number, moves: number, rng: number): number
}

function uint32(value: number, allowZero = true): boolean {
  return Number.isInteger(value) && value >= (allowZero ? 0 : 1) && value <= MAX_U32
}

function tile(value: number): boolean {
  if (!Number.isInteger(value) || value < 2 || value > MAX_TILE) return value === 0
  return Number.isInteger(Math.log2(value))
}

function isSnapshot(value: unknown): value is MergeSnapshot {
  if (!value || typeof value !== "object") return false
  const snapshot = value as Partial<MergeSnapshot>
  if (
    !Array.isArray(snapshot.cells) ||
    snapshot.cells.length !== CELL_COUNT ||
    !Array.from(snapshot.cells).every(tile) ||
    !Number.isSafeInteger(snapshot.score) ||
    (snapshot.score ?? -1) < 0 ||
    !uint32(snapshot.moves ?? -1) ||
    !uint32(snapshot.rng ?? 0, false)
  )
    return false
  return snapshot.cells.filter(Boolean).length >= 2
}

function readUint32s(memory: WebAssembly.Memory, pointer: number): number[] {
  return [...new Uint32Array(memory.buffer, pointer >>> 0, CELL_COUNT)]
}

function instantiate(exports: Merge4096Exports): MergeEngine {
  if (exports.game4096_version() !== 1) throw new Error("Unsupported 4096 engine version")

  return {
    newGame(seed) {
      return uint32(seed) && exports.game4096_new(seed) === 1
    },
    move(direction) {
      return uint32(direction) && direction <= 3 && exports.game4096_move(direction) === 1
    },
    read() {
      return {
        cells: readUint32s(exports.memory, exports.game4096_cells_ptr()),
        score: exports.game4096_score(),
        moves: exports.game4096_moves() >>> 0,
        rng: exports.game4096_rng() >>> 0,
        won: exports.game4096_won() === 1,
        over: exports.game4096_over() === 1
      }
    },
    restore(snapshot) {
      try {
        if (!isSnapshot(snapshot)) return false
        new Uint32Array(exports.memory.buffer, exports.game4096_input_ptr() >>> 0, CELL_COUNT).set(
          snapshot.cells
        )
        return exports.game4096_restore(snapshot.score, snapshot.moves, snapshot.rng) === 1
      } catch {
        return false
      }
    }
  }
}

export async function load4096Engine(wasmPath: string, signal?: AbortSignal): Promise<MergeEngine> {
  const source = await fetch(wasmPath, { signal })
  if (!source.ok) throw new Error(`4096 WASM module request failed: ${source.status}`)

  try {
    const { instance } = await WebAssembly.instantiateStreaming(source.clone())
    return instantiate(instance.exports as Merge4096Exports)
  } catch {
    const { instance } = await WebAssembly.instantiate(await source.arrayBuffer())
    return instantiate(instance.exports as Merge4096Exports)
  }
}
