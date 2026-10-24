/** Host for the dependency-free Sudoku engine. All board rules stay in WASM. */
export type Difficulty = 0 | 1 | 2
export type SudokuHint = { kind: 1 | 2 | 3 | 4 | 5 | 6; index: number; value: number; unit: number }
export type SudokuBoard = { givens: number[]; values: number[]; conflicts: boolean[] }
export type SudokuEngine = {
  generate(seed: number, difficulty: Difficulty): boolean
  read(): SudokuBoard
  set(index: number, value: number): boolean
  candidates(index: number): number[]
  complete(): boolean
  hint(): SudokuHint | null
  restore(givens: number[], values: number[]): boolean
}

type Exports = {
  memory: WebAssembly.Memory
  sudoku_version(): number
  sudoku_generate(seed: number, difficulty: number): number
  sudoku_givens_ptr(): number
  sudoku_values_ptr(): number
  sudoku_conflicts_ptr(): number
  sudoku_input_ptr(): number
  sudoku_hint_ptr(): number
  sudoku_restore(): number
  sudoku_set(index: number, value: number): number
  sudoku_candidates(index: number): number
  sudoku_complete(): number
  sudoku_hint(): number
}

function cell(value: number, maximum: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= maximum
}

function board(values: number[]): boolean {
  return values.length === 81 && values.every((value) => cell(value, 9))
}

function instantiate(exports: Exports): SudokuEngine {
  if (exports.sudoku_version() !== 1) throw new Error("Unsupported Sudoku engine version")
  const region = (pointer: number, length = 81) =>
    new Uint8Array(exports.memory.buffer, pointer, length)

  return {
    generate(seed, difficulty) {
      return cell(seed, 0xffffffff) && cell(difficulty, 2)
        ? exports.sudoku_generate(seed, difficulty) === 1
        : false
    },
    read() {
      return {
        givens: [...region(exports.sudoku_givens_ptr())],
        values: [...region(exports.sudoku_values_ptr())],
        conflicts: [...region(exports.sudoku_conflicts_ptr())].map(Boolean)
      }
    },
    set(index, value) {
      return cell(index, 80) && cell(value, 9) && exports.sudoku_set(index, value) === 1
    },
    candidates(index) {
      if (!cell(index, 80)) return []
      const mask = exports.sudoku_candidates(index)
      return Array.from({ length: 9 }, (_, index) => index + 1).filter(
        (digit) => mask & (1 << (digit - 1))
      )
    },
    complete: () => exports.sudoku_complete() === 1,
    hint() {
      if (!exports.sudoku_hint()) return null
      const [kind, index, value, unit] = region(exports.sudoku_hint_ptr(), 4)
      if (kind < 1 || kind > 6 || !cell(index, 80) || !cell(value, 9) || !cell(unit, 8)) {
        throw new Error("Invalid Sudoku hint")
      }
      return { kind: kind as SudokuHint["kind"], index, value, unit }
    },
    restore(givens, values) {
      if (!board(givens) || !board(values)) return false
      region(exports.sudoku_input_ptr(), 162).set([...givens, ...values])
      return exports.sudoku_restore() === 1
    }
  }
}

export async function loadSudokuEngine(path: string, signal?: AbortSignal): Promise<SudokuEngine> {
  const source = await fetch(path, { signal })
  if (!source.ok) throw new Error(`Sudoku engine request failed: ${source.status}`)
  let instance: WebAssembly.Instance
  try {
    const result = await WebAssembly.instantiateStreaming(source.clone())
    instance = result.instance
  } catch {
    const result = await WebAssembly.instantiate(await source.arrayBuffer())
    instance = result.instance
  }
  return instantiate(instance.exports as Exports)
}
