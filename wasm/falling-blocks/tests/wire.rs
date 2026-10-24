//! Host-target integration test over the exported WASM ABI. It runs on the
//! native toolchain, so the ABI stays checkable without building the wasm
//! artifact; the build script then re-verifies the real binary with the same
//! expectations (see `scripts/build-falling-blocks-wasm.sh`).

use falling_blocks::{
    blocks_board_ptr, blocks_ghost_row, blocks_hard_drop, blocks_hold, blocks_init, blocks_move,
    blocks_pause, blocks_preview, blocks_queue_ptr, blocks_rotate, blocks_soft_drop, blocks_start,
    blocks_state_ptr, blocks_tick,
};

/// Shared-region sizes documented in `src/lib.rs`. The layout module is
/// internal, so the expectations here double as an ABI drift check.
const BOARD_LEN: usize = 240;

/// On the host the whole shared block is `exported_memory()`, so region
/// offsets are the pointer deltas from the exported board pointer. The real
/// wasm artifact reads the same pointers as absolute linear-memory addresses.
fn memory() -> &'static [u8] {
    falling_blocks::exported_memory()
}

/// Offset of a region inside the shared block, from its exported pointer.
fn offset_of(ptr: i32) -> usize {
    (ptr - blocks_board_ptr()) as usize
}

fn state() -> [u8; 32] {
    let offset = offset_of(blocks_state_ptr());
    memory()[offset..offset + 32].try_into().unwrap()
}

fn board_filled_cells() -> usize {
    let base = offset_of(blocks_board_ptr());
    memory()[base..base + BOARD_LEN]
        .iter()
        .filter(|cell| **cell != 0)
        .count()
}

#[test]
fn init_start_move_and_drop_follow_the_documented_abi() {
    blocks_init(0xdead, 0xbeef);

    assert_eq!(state()[16], 0, "status ready after init");
    assert_eq!(board_filled_cells(), 0, "empty board after init");

    blocks_start();
    assert_eq!(state()[16], 1, "status playing after start");
    assert!((1..=6).contains(&state()[17]), "piece id spawned");

    blocks_move(-1);
    assert_eq!(blocks_move(-32), 0, "walls stop the piece");

    blocks_rotate(1);
    let distance = blocks_ghost_row() as i32 - state()[20] as i32;
    assert!(distance >= 0, "ghost never sits above the piece");

    let board_before = board_filled_cells();
    let active_count = memory()[272..288].iter().filter(|cell| **cell != 0).count();
    blocks_soft_drop();
    let scored_soft = u32::from_le_bytes(state()[0..4].try_into().unwrap());
    assert_eq!(scored_soft, 1, "a soft drop scores a point");

    blocks_hard_drop();
    let score = u32::from_le_bytes(state()[0..4].try_into().unwrap());
    assert!(score > scored_soft, "hard drop scored distance points");
    assert_eq!(
        board_filled_cells(),
        board_before + active_count,
        "the piece locked once"
    );

    blocks_pause();
    assert_eq!(state()[16], 2, "status paused");
    blocks_pause();
    assert_eq!(state()[16], 1, "status resumed");

    let score_before_tick = u32::from_le_bytes(state()[0..4].try_into().unwrap());
    blocks_tick(1000);
    let score_after_tick = u32::from_le_bytes(state()[0..4].try_into().unwrap());
    assert!(
        score_after_tick >= score_before_tick,
        "gravity never reduces the score"
    );

    blocks_hold();
    assert_eq!(state()[22], 0, "hold disables holding until the next lock");

    assert_eq!(blocks_preview(3), 3, "Bar preview size");
    assert_eq!(blocks_preview(2), 2, "Domino preview size");
    assert_eq!(blocks_preview(0), 0, "unknown ids have no shape");
    assert_eq!(
        blocks_queue_ptr(),
        blocks_board_ptr() + 304,
        "queue follows preview"
    );
}
