use super::*;

#[test]
fn mosaic_uses_a_square_board_and_mixed_size_pieces() {
    assert_eq!((COLS, ROWS), (12, 12));
    let counts: Vec<usize> = PIECE_IDS
        .iter()
        .map(|id| {
            let mut cells = [0; 16];
            spawn_cells(*id, &mut cells);
            cells.iter().filter(|cell| **cell != 0).count()
        })
        .collect();
    assert_eq!(counts, [1, 2, 3, 3, 4, 5]);
}

#[test]
fn rotations_preserve_cells_and_return_after_four_turns() {
    for id in PIECE_IDS {
        let mut cells = [0; 16];
        spawn_cells(id, &mut cells);
        let size = spawn_size(id);
        let mut rotated = cells;
        for _ in 0..4 {
            rotated = rotate_cells(&rotated, size, 1);
        }
        assert_eq!(rotated, cells);
        assert_eq!(
            rotate_cells(&rotate_cells(&cells, size, 1), size, -1),
            cells
        );
    }
}

#[test]
fn collision_and_landing_respect_walls_floor_and_occupied_cells() {
    let mut cells = [0; 16];
    spawn_cells(1, &mut cells);
    let mut board = [0; BOARD_SIZE];
    board[(ROWS - 1) * COLS + 4] = 2;
    assert!(collides(&board, &cells, 1, -1, 0));
    assert!(collides(&board, &cells, 1, COLS as i8, 0));
    assert!(collides(&board, &cells, 1, 0, ROWS as i8));
    assert!(!collides(&board, &cells, 1, 0, -1));
    assert_eq!(ghost_row(&board, &cells, 1, 4, 0), ROWS as i8 - 2);
    assert_eq!(ghost_row(&board, &cells, 1, 5, 0), ROWS as i8 - 1);
}

#[test]
fn only_complete_aligned_regions_clear() {
    let mut board = [0; BOARD_SIZE];
    board[(ROWS - 1) * COLS..].fill(1);
    assert_eq!(
        clear_regions(&mut board),
        0,
        "a full row alone does not clear"
    );
    for row in ROWS - 3..ROWS {
        for col in 0..3 {
            board[row * COLS + col] = 2;
        }
    }
    assert_eq!(clear_regions(&mut board), 1);
    assert!(
        board[(ROWS - 1) * COLS..(ROWS - 1) * COLS + 3]
            .iter()
            .all(|c| *c == 0)
    );
    assert_eq!(board[BOARD_SIZE - 1], 1, "neighboring regions remain");
}

#[test]
fn clearing_settles_each_column_and_resolves_cascades() {
    let mut board = [0; BOARD_SIZE];
    for row in ROWS - 3..ROWS {
        for col in 0..3 {
            board[row * COLS + col] = 2;
        }
    }
    // Staggered cells do not fill any upper region until the first clear.
    for (col, rows) in [(0, [0, 2, 4]), (1, [1, 3, 5]), (2, [0, 3, 6])] {
        for row in rows {
            board[row * COLS + col] = 3;
        }
    }
    let (regions, score) = resolve_regions(&mut board, 1);
    assert_eq!(regions, 2);
    assert_eq!(score, 90 + 180, "each cascade increases the multiplier");
    assert!(board.iter().all(|c| *c == 0));
}

#[test]
fn settling_preserves_cell_order_and_other_columns() {
    let mut board = [0; BOARD_SIZE];
    board[0] = 2;
    board[2 * COLS] = 3;
    board[COLS + 1] = 4;
    settle_columns(&mut board);
    assert_eq!(board[(ROWS - 2) * COLS], 2);
    assert_eq!(board[(ROWS - 1) * COLS], 3);
    assert_eq!(board[(ROWS - 1) * COLS + 1], 4);
    assert_eq!(board.iter().filter(|c| **c != 0).count(), 3);
}

#[test]
fn progression_speeds_up_every_six_regions_with_a_lower_bound() {
    assert_eq!(level_for_regions(0), 1);
    assert_eq!(level_for_regions(5), 1);
    assert_eq!(level_for_regions(6), 2);
    assert!(drop_interval(2) < drop_interval(1));
    assert_eq!(drop_interval(10_000), 100);
}
