//! Dependency-free 4×4 tile-merging game, WASM ABI version 1.
//!
//! All exports use the prefix `game4096_`. `new(seed)` starts with two tiles;
//! `move(direction)` returns 1 only for a changed board. Directions are
//! 0 left, 1 up, 2 right, 3 down. A changed move compresses and merges each
//! original tile at most once, scores resulting merged values, and spawns one
//! tile (2 on nine of ten random draws, 4 on one). No-op moves preserve RNG.
//!
//! `cells_ptr()` and `input_ptr()` are aligned regions of 16 little-endian u32
//! actual tile values. `score()` returns a safe integer as f64; `moves()` and
//! `rng()` return u32. `won()` means a tile is at least 4096 and does not stop
//! further moves. `over()` means no direction can change the board.
//!
//! For `restore(score: f64, moves: u32, rng: u32)`, write input tiles first.
//! Valid tiles are zero or powers of two from 2 through 2^31, with at least two
//! nonempty cells. Score must be finite, integral, nonnegative and at most
//! 2^53−1; RNG must be nonzero. Rejected snapshots preserve every state field.
//! At numeric limits, score saturates at 2^53−1 and moves at u32::MAX. Tiles of
//! 2^31 remain separate rather than overflowing; other pairs can still merge.
//! These bounds keep hostile restored values safe without freezing valid moves.
//!
//! The engine is single-threaded and does not allocate at runtime. Region
//! addresses are stable, but hosts should snapshot shared values between calls.

mod game;
mod rules;

use game::Game;
use rules::CELLS;

#[repr(C)]
struct Shared {
    cells: [u32; CELLS],
    input: [u32; CELLS],
}

struct Engine {
    game: Game,
    shared: Shared,
}

struct EngineCell(std::cell::UnsafeCell<Engine>);

// SAFETY: the ABI runs as one non-reentrant, single-threaded WebAssembly engine.
// The global ABI test also runs sequentially, independently of pure rule tests.
unsafe impl Sync for EngineCell {}

static ENGINE: EngineCell = EngineCell(std::cell::UnsafeCell::new(Engine {
    game: Game::EMPTY,
    shared: Shared {
        cells: [0; CELLS],
        input: [0; CELLS],
    },
}));

fn engine() -> &'static mut Engine {
    // SAFETY: only the single-threaded, non-reentrant exports access this cell.
    unsafe { &mut *ENGINE.0.get() }
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_version() -> u32 {
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_new(seed: u32) -> u32 {
    let state = engine();
    state.game = Game::new(seed);
    state.shared.cells = state.game.cells;
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_cells_ptr() -> u32 {
    engine().shared.cells.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_input_ptr() -> u32 {
    engine().shared.input.as_ptr() as usize as u32
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_move(direction: u32) -> u32 {
    let state = engine();
    if !state.game.move_to(direction) {
        return 0;
    }
    state.shared.cells = state.game.cells;
    1
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_score() -> f64 {
    engine().game.score as f64
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_moves() -> u32 {
    engine().game.moves
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_rng() -> u32 {
    engine().game.rng
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_won() -> u32 {
    u32::from(engine().game.won())
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_over() -> u32 {
    u32::from(engine().game.over())
}

#[unsafe(no_mangle)]
pub extern "C" fn game4096_restore(score: f64, moves: u32, rng: u32) -> u32 {
    let state = engine();
    let Some(game) = Game::restore(state.shared.input, score, moves, rng) else {
        return 0;
    };
    state.game = game;
    state.shared.cells = state.game.cells;
    1
}

#[cfg(test)]
mod tests;
