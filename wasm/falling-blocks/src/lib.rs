//! Falling Blocks rules engine for cleisson.com/games, compiled to WebAssembly.
//!
//! # WASM ABI (v1, little-endian)
//!
//! Exports (all prefixed `blocks_`):
//!
//! - `init(seed_hi: u32, seed_lo: u32)` — full reset with a 64-bit seed,
//!   status goes to `ready`.
//! - `start()` — fresh run, status goes to `playing`.
//! - `pause()` — toggles `playing`/`paused`.
//! - `tick(delta_ms: u32)` — gravity accounting; pass the frame delta.
//! - `move(dx: i32) -> i32` — 1 when the piece moved, 0 when blocked.
//! - `rotate(dir: i32) -> i32` — `>0` = clockwise, `<0` = counter-clockwise.
//! - `soft_drop() -> i32`, `hard_drop() -> i32`, `hold() -> i32` — 1 on success.
//! - `preview(id: u32) -> i32` — writes the spawn matrix of piece id
//!   `1..=6` into the preview region and returns its size (0 for no piece).
//! - `state_ptr()`, `board_ptr()`, `piece_cells_ptr()`, `preview_ptr()`,
//!   `queue_ptr()` — absolute addresses of the shared regions in linear
//!   memory, in the documented order.
//!
//! Shared regions (contiguous, deterministic layout, all inside one block in
//! linear memory — the `*_ptr()` exports resolve the actual addresses):
//!
//! - board: 144 bytes, row-major 12×12, `0` = empty, `1..=6` = piece id;
//! - state: 32 bytes — see `STATE_LAYOUT` for the field offsets;
//! - piece cells: 16 bytes, active piece matrix (stride 4; use
//!   `state.piece_size` for the meaningful area);
//! - preview: 16 bytes, scratch region for `preview(id)` (stride 4);
//! - queue: 3 bytes, next piece ids.
//!
//! Game-state mutations refresh board, state, piece and queue before returning;
//! preview only writes its scratch region. Hosts snapshot between calls. The game is
//! single-threaded by WebAssembly design; the global engine cell relies on
//! it and never allocates at runtime.

mod engine;
mod rules;

use engine::Game;
use rules::BOARD_SIZE;

/// Memory layout offsets of the shared regions, relative to the base of a
/// single shared block, mirrored in `lib/falling-blocks/abi.ts`. The absolute base
/// address is chosen by the linker, so region pointers are exposed at runtime
/// through the `*_ptr()` exports instead of being compile-time constants.
mod layout {
    pub const STATE_LEN: usize = 32;
    pub const BOARD_LEN: usize = crate::rules::BOARD_SIZE;
    pub const PIECE_CELLS_LEN: usize = 16;
    pub const PREVIEW_LEN: usize = 16;
    pub const QUEUE_LEN: usize = 3;

    pub const BOARD: usize = 0;
    pub const STATE: usize = BOARD + BOARD_LEN;
    pub const PIECE_CELLS: usize = STATE + STATE_LEN;
    pub const PREVIEW: usize = PIECE_CELLS + PIECE_CELLS_LEN;
    pub const QUEUE: usize = PREVIEW + PREVIEW_LEN;
    pub const TOTAL: usize = QUEUE + QUEUE_LEN;
}

/// Byte offsets inside the 32-byte state region as `[offset, length]` pairs:
/// `score`, `lines`, `level`, `dropTimer` (elapsed gravity time) as `u32`; then bytes at 16..23
/// hold `status`, `pieceType`, `pieceSize`, `pieceX`, `pieceY`, `held`,
/// `canHold`; `ghostRow` sits at 23.
pub const STATE_LAYOUT: [[usize; 2]; 6] = [[0, 4], [4, 4], [8, 4], [12, 4], [16, 7], [23, 1]];

struct EngineCell {
    game: std::cell::UnsafeCell<Option<Game>>,
    memory: std::cell::UnsafeCell<[u8; layout::TOTAL]>,
}

// SAFETY: The exported ABI is the only consumer and WebAssembly execution is
// single-threaded; no re-entrancy happens while one export call is running.
unsafe impl Sync for EngineCell {}

static ENGINE: EngineCell = EngineCell {
    game: std::cell::UnsafeCell::new(None),
    memory: std::cell::UnsafeCell::new([0; layout::TOTAL]),
};

fn game() -> &'static mut Game {
    // SAFETY: single-threaded wasm, see the doc comment on EngineCell.
    let slot = unsafe { &mut *ENGINE.game.get() };
    if slot.is_none() {
        *slot = Some(Game::new(0));
    }
    slot.as_mut().unwrap()
}

/// Copy all shared regions into the exported memory after mutations.
fn sync(game: &Game) {
    // SAFETY: single-threaded wasm, see the doc comment on EngineCell.
    let memory = unsafe { &mut *ENGINE.memory.get() };
    memory[layout::BOARD..layout::BOARD + BOARD_SIZE].copy_from_slice(&game.board);

    let state = &mut memory[layout::STATE..layout::STATE + layout::STATE_LEN];
    state[0..4].copy_from_slice(&game.score.to_le_bytes());
    state[4..8].copy_from_slice(&game.lines.to_le_bytes());
    state[8..12].copy_from_slice(&game.level.to_le_bytes());
    state[12..16].copy_from_slice(&game.drop_timer.to_le_bytes());

    state[16] = game.status as u8;
    state[17] = game.piece.as_ref().map_or(0, |piece| piece.id);
    state[18] = game.piece.as_ref().map_or(0, |piece| piece.size) as u8;
    state[19] = game.piece.as_ref().map_or(0, |piece| piece.x) as u8;
    state[20] = game.piece.as_ref().map_or(0, |piece| piece.y) as u8;
    state[21] = game.held.unwrap_or(0);
    state[22] = u8::from(game.can_hold);
    state[23] = game.ghost_row_of_piece() as u8;

    memory[layout::PIECE_CELLS..layout::PIECE_CELLS + layout::PIECE_CELLS_LEN].fill(0);
    if let Some(piece) = &game.piece {
        memory[layout::PIECE_CELLS..layout::PIECE_CELLS + layout::PIECE_CELLS_LEN]
            .copy_from_slice(&piece.cells);
    }
    memory[layout::QUEUE..layout::QUEUE + layout::QUEUE_LEN].copy_from_slice(&game.queue);
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_init(seed_hi: u32, seed_lo: u32) {
    let g = game();
    *g = Game::new((u64::from(seed_hi) << 32) | u64::from(seed_lo));
    sync(g);
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_start() {
    let g = game();
    g.start();
    sync(g);
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_pause() {
    let g = game();
    g.pause();
    sync(g);
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_tick(delta_ms: u32) {
    let g = game();
    g.tick(delta_ms);
    sync(g);
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_move(dx: i32) -> i32 {
    if dx != -1 && dx != 1 {
        return 0;
    }
    let g = game();
    let result = i32::from(g.move_sideways(dx as i8));
    sync(g);
    result
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_rotate(direction: i32) -> i32 {
    if direction != -1 && direction != 1 {
        return 0;
    }
    let g = game();
    let result = i32::from(g.rotate(direction as i8));
    sync(g);
    result
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_soft_drop() -> i32 {
    let g = game();
    let result = i32::from(g.soft_drop());
    sync(g);
    result
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_hard_drop() -> i32 {
    let g = game();
    let result = i32::from(g.hard_drop());
    sync(g);
    result
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_hold() -> i32 {
    let g = game();
    let result = i32::from(g.hold());
    sync(g);
    result
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_ghost_row() -> i32 {
    game().ghost_row_of_piece() as i32
}

/// Writes the spawn matrix of piece id into the preview region and returns
/// its side length (0 for unknown ids).
#[unsafe(no_mangle)]
pub extern "C" fn blocks_preview(id: u32) -> i32 {
    let id = u8::try_from(id).unwrap_or(0);
    let size = rules::spawn_size(id);
    if size > 0 {
        // SAFETY: single-threaded wasm, see the doc comment on EngineCell.
        let memory = unsafe { &mut *ENGINE.memory.get() };
        let mut cells = [0u8; 16];
        rules::spawn_cells(id, &mut cells);
        memory[layout::PREVIEW..layout::PREVIEW + layout::PREVIEW_LEN].copy_from_slice(&cells);
    }
    size as i32
}

/// Read-only view over the exported memory regions. Used by the integration
/// tests and the build-time wasm verifier; runtime code reads linear memory
/// directly, so this costs nothing in the artifact.
#[doc(hidden)]
pub fn exported_memory() -> &'static [u8; layout::TOTAL] {
    // SAFETY: single-threaded wasm/target execution; no re-entrancy here.
    unsafe { &*ENGINE.memory.get() }
}

/// Absolute base address of the shared memory block inside linear memory.
/// The linker decides where the static lands, so the exported pointers below
/// derive every region address from it at runtime.
fn memory_base() -> usize {
    // SAFETY: single-threaded wasm, see the doc comment on EngineCell.
    (unsafe { &*ENGINE.memory.get() } as *const [u8; layout::TOTAL]).cast::<u8>() as usize
}

/// Address of a shared region as the `i32` the ABI returns. On wasm32 the
/// block always sits below 2^31; host targets may carry a wider base, whose
/// low bits truncate without breaking the relative offsets between regions.
fn region_ptr(offset: usize) -> i32 {
    (memory_base() + offset) as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_state_ptr() -> i32 {
    region_ptr(layout::STATE)
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_board_ptr() -> i32 {
    region_ptr(layout::BOARD)
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_piece_cells_ptr() -> i32 {
    region_ptr(layout::PIECE_CELLS)
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_preview_ptr() -> i32 {
    region_ptr(layout::PREVIEW)
}

#[unsafe(no_mangle)]
pub extern "C" fn blocks_queue_ptr() -> i32 {
    region_ptr(layout::QUEUE)
}

/// The exported ABI is a global single engine, so the integration checks have
/// to run sequentially. One combined test keeps the WASM contract checkable
/// on the host target too, without parallel workers fighting over the state.
#[cfg(test)]
mod tests {
    use super::*;
    use engine::Status;

    /// Reads back the bounds of the shared regions.
    fn region(at: usize, len: usize) -> Vec<u8> {
        exported_memory()[at..at + len].to_vec()
    }

    fn state() -> Vec<u8> {
        region(layout::STATE, layout::STATE_LEN)
    }

    /// The exported ABI drives a single global engine, so the integration
    /// checks run in one test: parallel workers would fight over the state.
    #[test]
    fn the_exported_abi_follows_the_documented_layout() {
        // Region pointers share one base and stay contiguous, whatever address
        // the linker gave the shared block: board, state, piece cells,
        // preview, queue. The wire test proves the pointers really resolve
        // into this block by reading live state through them.
        let board = blocks_board_ptr();
        assert_eq!(
            blocks_state_ptr() - board,
            (layout::STATE - layout::BOARD) as i32
        );
        assert_eq!(
            blocks_piece_cells_ptr() - board,
            (layout::PIECE_CELLS - layout::BOARD) as i32
        );
        assert_eq!(
            blocks_preview_ptr() - board,
            (layout::PREVIEW - layout::BOARD) as i32
        );
        assert_eq!(
            blocks_queue_ptr() - board,
            (layout::QUEUE - layout::BOARD) as i32
        );
        let _ = STATE_LAYOUT;

        blocks_init(1, 2);
        assert!(
            region(layout::BOARD, BOARD_SIZE)
                .iter()
                .all(|cell| *cell == 0)
        );
        assert_eq!(state()[16], Status::Ready as u8);
        assert_eq!(&state()[8..12], &1u32.to_le_bytes(), "level starts at 1");

        blocks_start();
        assert_eq!(state()[16], Status::Playing as u8);
        assert!((1..=6).contains(&state()[17]), "a piece spawned");

        blocks_move(-1);
        assert_eq!(blocks_move(-32), 0, "walls stop the piece");

        let score_before = u32::from_le_bytes(state()[0..4].try_into().unwrap());
        let filled_before = region(layout::BOARD, BOARD_SIZE)
            .iter()
            .filter(|cell| **cell != 0)
            .count();

        let active_count = region(layout::PIECE_CELLS, 16)
            .iter()
            .filter(|cell| **cell != 0)
            .count();
        blocks_soft_drop();
        let score_after_soft = u32::from_le_bytes(state()[0..4].try_into().unwrap());
        assert_eq!(
            score_after_soft - score_before,
            1,
            "a soft drop scores a point"
        );

        blocks_hard_drop();
        let score_after_hard = u32::from_le_bytes(state()[0..4].try_into().unwrap());
        assert!(
            score_after_hard > score_after_soft,
            "hard drop scored distance points"
        );
        let filled_after = region(layout::BOARD, BOARD_SIZE)
            .iter()
            .filter(|cell| **cell != 0)
            .count();
        assert_eq!(
            filled_after,
            filled_before + active_count,
            "the active piece locked once"
        );

        blocks_pause();
        assert_eq!(state()[16], Status::Paused as u8);
        blocks_pause();
        assert_eq!(state()[16], Status::Playing as u8);

        blocks_init(0, 3);
        assert_eq!(state()[16], Status::Ready as u8, "init resets every region");

        assert!(
            region(layout::PIECE_CELLS, 16)
                .iter()
                .all(|cell| *cell == 0)
        );
        assert_eq!(blocks_move(256), 0);
        assert_eq!(blocks_rotate(256), 0);
        assert_eq!(blocks_preview(1), 1);
        assert_eq!(region(layout::PREVIEW, 16)[0], 1);
        assert_eq!(blocks_preview(2), 2);
        assert_eq!(region(layout::PREVIEW, layout::PREVIEW_LEN)[0..2], [1, 1]);
        assert_eq!(blocks_preview(0), 0);

        let queue = region(layout::QUEUE, layout::QUEUE_LEN);
        assert!(
            queue.iter().all(|id| (1..=6).contains(id)),
            "ready queue holds valid piece ids"
        );

        blocks_start();
        let game = game();
        game.board.fill(0);
        game.board[(rules::ROWS - 1) * rules::COLS + 1..].fill(2);
        let mut cells = [0; 16];
        rules::spawn_cells(1, &mut cells);
        game.piece = Some(engine::Piece {
            id: 1,
            size: 1,
            cells,
            x: 0,
            y: 0,
        });
        blocks_hard_drop();
        assert_eq!(&state()[4..8], &1u32.to_le_bytes(), "one cleared line");
        assert_eq!(
            &state()[0..4],
            &112u32.to_le_bytes(),
            "clear and drop score"
        );
        assert!(
            region(layout::BOARD, BOARD_SIZE)
                .iter()
                .all(|cell| *cell == 0)
        );
    }
}
