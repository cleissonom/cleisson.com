//! Dependency-free Sudoku engine. WASM ABI version 1, single-threaded.
//!
//! `sudoku_generate(seed, difficulty)` creates a seeded puzzle (0/1/2 mean
//! 42/35/29 clues). It returns 1 on success; rejected inputs preserve the game.
//! The labels indicate clue count, not a human solving-strategy grade.
//! `sudoku_set(index, value)` accepts editable cells 0..80 and values 0..9,
//! including duplicate digits and unchanged values; givens cannot be edited.
//! `sudoku_candidates(index)` returns bits 0..8 for legal digits 1..9 in an empty
//! cell. `sudoku_complete()` is 1 only for the fully correct solution.
//!
//! Exported pointers resolve live byte regions: givens[81], values[81],
//! conflicts[81] (0/1, including all duplicate peers), hint[4], input[162].
//! `sudoku_hint()` is advisory and returns the kind also written to hint:
//! [kind, cell index, value, unit index]. Kinds: 0 none, 1 naked single,
//! 2 row hidden single, 3 column hidden single, 4 box hidden single,
//! 5 clear wrong entry (value 0), 6 solution reveal. Unit indices are 0..8.
//! A caller applies an offered hint with `sudoku_set`.
//!
//! To restore, write givens followed by values to input and call
//! `sudoku_restore()`. At least 24 givens, valid digits, matching given values,
//! and a proven unique solution within 100,000 search nodes are required.
//! Rejection returns 0 and preserves the current game. Pointers remain stable;
//! normal mutations clear a stale hint. The engine does not allocate at runtime.

#[cfg(test)]
mod fixtures;
mod game;
mod puzzle;

use game::{Game, NO_HINT};
use puzzle::CELLS;

#[repr(C)]
struct Shared {
    givens: [u8; CELLS],
    values: [u8; CELLS],
    conflicts: [u8; CELLS],
    hint: [u8; 4],
    input: [u8; CELLS * 2],
}

struct Engine {
    game: Game,
    shared: Shared,
}

impl Engine {
    fn sync(&mut self) {
        self.shared.givens = self.game.givens;
        self.shared.values = self.game.values;
        self.shared.conflicts = self.game.conflicts();
        self.shared.hint = [NO_HINT.kind, 0, 0, 0];
    }
}

struct EngineCell(std::cell::UnsafeCell<Engine>);

// SAFETY: the ABI is a single engine used by single-threaded WebAssembly.
// Calls cannot re-enter while an export is executing. The ABI test runs serially.
unsafe impl Sync for EngineCell {}

static ENGINE: EngineCell = EngineCell(std::cell::UnsafeCell::new(Engine {
    game: Game::EMPTY,
    shared: Shared {
        givens: [0; CELLS],
        values: [0; CELLS],
        conflicts: [0; CELLS],
        hint: [0; 4],
        input: [0; CELLS * 2],
    },
}));

fn engine() -> &'static mut Engine {
    // SAFETY: only the non-reentrant, single-threaded ABI accesses this cell.
    unsafe { &mut *ENGINE.0.get() }
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_version() -> u32 {
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_generate(seed: u32, difficulty: u32) -> u32 {
    let Some(puzzle) = puzzle::generate(seed, difficulty) else {
        return 0;
    };
    let state = engine();
    state.game = Game::new(puzzle);
    state.sync();
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_set(index: u32, value: u32) -> u32 {
    if value > 9 {
        return 0;
    }
    let state = engine();
    if !state.game.set(index as usize, value as u8) {
        return 0;
    }
    state.sync();
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_candidates(index: u32) -> u32 {
    u32::from(engine().game.candidates(index as usize))
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_complete() -> u32 {
    u32::from(engine().game.complete())
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_hint() -> u32 {
    let state = engine();
    let hint = state.game.hint();
    state.shared.hint = [hint.kind, hint.index, hint.value, hint.unit];
    u32::from(hint.kind)
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_restore() -> u32 {
    let state = engine();
    let givens = state.shared.input[..CELLS].try_into().unwrap();
    let values = state.shared.input[CELLS..].try_into().unwrap();
    let Some(game) = Game::restore(givens, values) else {
        return 0;
    };
    state.game = game;
    state.sync();
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_givens_ptr() -> u32 {
    engine().shared.givens.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_values_ptr() -> u32 {
    engine().shared.values.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_conflicts_ptr() -> u32 {
    engine().shared.conflicts.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_hint_ptr() -> u32 {
    engine().shared.hint.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn sudoku_input_ptr() -> u32 {
    engine().shared.input.as_ptr() as usize as u32
}

#[cfg(test)]
mod tests;
