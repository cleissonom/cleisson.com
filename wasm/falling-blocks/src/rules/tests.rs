use super::*;

#[test]
fn uses_a_square_board_and_mixed_size_pieces() {
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
fn a_complete_horizontal_row_clears() {
    let mut board = [0; BOARD_SIZE];
    board[(ROWS - 1) * COLS..].fill(1);
    assert_eq!(resolve_lines(&mut board, 1), (1, 90));
    assert_eq!(board, [0; BOARD_SIZE]);
}

#[test]
fn incomplete_rows_and_completed_squares_remain_unchanged() {
    let mut board = [0; BOARD_SIZE];
    for row in ROWS - 3..ROWS {
        for col in 0..3 {
            board[row * COLS + col] = 2;
        }
    }
    board[5 * COLS..6 * COLS - 1].fill(3);
    board[0] = 4;
    let before = board;
    assert_eq!(resolve_lines(&mut board, 1), (0, 0));
    assert_eq!(
        board, before,
        "holes and unsupported cells stay in their rows"
    );
}

#[test]
fn separated_complete_rows_collapse_without_rearranging_remaining_cells() {
    let mut board = [0; BOARD_SIZE];
    for row in [2, 8, 11] {
        board[row * COLS..(row + 1) * COLS].fill(1);
    }
    for (row, col, id) in [(0, 0, 2), (1, 1, 3), (3, 2, 4), (10, 3, 5)] {
        board[row * COLS + col] = id;
    }
    let before = board;
    assert_eq!(resolve_lines(&mut board, 2), (3, 540));
    assert_eq!(&board[..3 * COLS], &[0; 3 * COLS]);
    for (source, destination) in [(0, 3), (1, 4), (3, 5), (10, 11)] {
        assert_eq!(
            &board[destination * COLS..(destination + 1) * COLS],
            &before[source * COLS..(source + 1) * COLS]
        );
    }
    assert_eq!(board.iter().filter(|cell| **cell != 0).count(), 4);
}

#[test]
fn adjacent_complete_rows_score_once_each_without_cascade_multiplier() {
    let mut board = [0; BOARD_SIZE];
    board[(ROWS - 3) * COLS..].fill(2);
    assert_eq!(resolve_lines(&mut board, 3), (3, 810));
    assert_eq!(board, [0; BOARD_SIZE]);
}

#[test]
fn progression_speeds_up_every_six_lines_with_a_lower_bound() {
    assert_eq!(level_for_lines(0), 1);
    assert_eq!(level_for_lines(5), 1);
    assert_eq!(level_for_lines(6), 2);
    assert!(drop_interval(2) < drop_interval(1));
    assert_eq!(drop_interval(10_000), 100);
}
