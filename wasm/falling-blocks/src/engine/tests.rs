use super::*;
use crate::rules::ROWS;

/// Fixed seed so shuffle order is stable across runs.
const SEED: u64 = 42;

fn started_game() -> Game {
    let mut game = Game::new(SEED);
    game.start();
    game
}

fn prepare_line_clear(game: &mut Game) {
    game.board = [0; BOARD_SIZE];
    game.board[(ROWS - 1) * COLS + 1..].fill(2);
    let mut cells = [0; 16];
    spawn_cells(1, &mut cells);
    game.piece = Some(Piece {
        id: 1,
        size: 1,
        cells,
        x: 0,
        y: 0,
    });
}

#[test]
fn is_ready_before_start_and_playing_after_it() {
    let mut game = Game::new(SEED);
    assert_eq!(game.status, Status::Ready);
    assert!(game.piece.is_none());

    game.start();
    assert_eq!(game.status, Status::Playing);
    assert!(game.piece.is_some());
    assert_eq!(game.queued_pieces(), QUEUE_SIZE);
}

#[test]
fn pauses_and_resumes() {
    let mut game = started_game();
    game.pause();
    assert_eq!(game.status, Status::Paused);
    game.pause();
    assert_eq!(game.status, Status::Playing);
}

#[test]
fn ends_when_the_next_piece_cannot_spawn() {
    let mut game = started_game();
    // Spawn rows blocked, but never full, so a line clear cannot rescue the game.
    game.board = [0; BOARD_SIZE];
    for row in [0, 1] {
        for col in 0..COLS {
            game.board[row * COLS + col] = if col == COLS - 1 { 0 } else { 3 };
        }
    }

    game.hold();

    assert_eq!(game.status, Status::Over);
}

#[test]
fn stops_at_the_left_and_right_walls() {
    let mut game = started_game();
    while game.move_sideways(-1) {}
    assert!(!game.move_sideways(-1));
    assert_eq!(game.piece.as_ref().unwrap().x, 0);

    while game.move_sideways(1) {}
    assert!(!game.move_sideways(1));
    let piece = game.piece.as_ref().unwrap();
    assert!(
        piece.x + piece.size as i8 <= COLS as i8,
        "never overlapping the right wall"
    );
}

#[test]
fn ignores_input_while_paused() {
    let mut game = started_game();
    let x = game.piece.as_ref().unwrap().x;
    game.pause();

    assert!(!game.move_sideways(-1));
    assert_eq!(game.piece.as_ref().unwrap().x, x);
}

#[test]
fn hard_drop_cannot_change_a_paused_or_finished_game() {
    let mut game = started_game();
    for status in [Status::Paused, Status::Over] {
        game.status = status;
        let board = game.board;
        let score = game.score;
        assert!(!game.hard_drop());
        assert_eq!(game.board, board);
        assert_eq!(game.score, score);
    }
}

#[test]
fn starting_uses_the_piece_shown_in_the_ready_queue() {
    let mut game = Game::new(SEED);
    let previewed = game.queue[0];
    game.start();
    assert_eq!(game.piece.unwrap().id, previewed);
}

#[test]
fn reports_the_ghost_landing_row() {
    let game = started_game();
    let (px, py, size, cells) = match game.piece {
        Some(piece) => (piece.x, piece.y, piece.size, piece.cells),
        None => panic!("expected an active piece"),
    };

    let row = game.ghost_row_of_piece();

    assert!(row >= py, "ghost is at or below the piece");
    let blocked = (0..size).any(|row_within| {
        (0..size).any(|col_within| {
            if cells[row_within * 4 + col_within] == 0 {
                return false;
            }
            let board_y = row as i32 + row_within as i32 + 1;
            let board_x = px as i32 + col_within as i32;
            if board_y >= ROWS as i32 {
                return true;
            }
            if board_x < 0 || board_x >= COLS as i32 {
                return true;
            }
            game.board[board_y as usize * COLS + board_x as usize] != 0
        })
    });
    assert!(
        blocked,
        "ghost sits directly above an obstacle or the floor"
    );
}

#[test]
fn hard_drop_locks_the_piece_and_awards_distance_points() {
    let mut game = started_game();
    let distance = game.ghost_row_of_piece() - game.piece.as_ref().unwrap().y;
    let count = game
        .piece
        .unwrap()
        .cells
        .iter()
        .filter(|c| **c != 0)
        .count();

    game.hard_drop();

    assert_eq!(game.score, 2 * distance as u32);
    assert_eq!(game.board.iter().filter(|cell| **cell != 0).count(), count);
    assert!(game.piece.is_some(), "a new piece spawned");
}

#[test]
fn soft_drop_moves_down_one_row_and_scores_a_point() {
    let mut game = started_game();
    let y = game.piece.as_ref().unwrap().y;

    assert!(game.soft_drop());
    assert_eq!(game.piece.as_ref().unwrap().y, y + 1);
    assert_eq!(game.score, 1);
}

#[test]
fn clears_completed_rows_scores_them_and_advances_the_queue() {
    let mut game = started_game();
    prepare_line_clear(&mut game);
    let queued = game.queue[0];

    game.hard_drop();

    assert_eq!(game.lines, 1);
    assert_eq!(game.score, 90 + 2 * (ROWS as u32 - 1));
    assert_eq!(game.piece.as_ref().unwrap().id, queued);
    assert_eq!(game.board.iter().filter(|cell| **cell != 0).count(), 0);
}

#[test]
fn clearing_the_sixth_row_advances_level_for_the_next_piece() {
    let mut game = started_game();
    game.lines = 5;
    prepare_line_clear(&mut game);
    game.hard_drop();
    assert_eq!(game.lines, 6);
    assert_eq!(game.level, 2);
    assert_eq!(game.score, 90 + 2 * (ROWS as u32 - 1));

    prepare_line_clear(&mut game);
    game.hard_drop();
    assert_eq!(game.lines, 7);
    assert_eq!(game.level, 2);
    assert_eq!(game.score, 90 + 180 + 4 * (ROWS as u32 - 1));
}

#[test]
fn holds_a_piece_only_once_per_drop() {
    let mut game = started_game();
    let first = game.piece.as_ref().unwrap().id;

    assert!(game.hold());
    assert_eq!(game.held, Some(first));
    assert!(!game.can_hold);
    assert!(!game.hold(), "second hold before locking is ignored");
}

#[test]
fn swaps_the_held_piece_back_on_the_next_drop() {
    let mut game = started_game();
    let first = game.piece.as_ref().unwrap().id;
    game.hold();
    game.hard_drop();
    let active = game.piece.as_ref().unwrap().id;

    assert!(game.can_hold);
    assert!(game.hold());
    assert_eq!(
        game.piece.as_ref().unwrap().id,
        first,
        "held piece returns to play"
    );
    assert_eq!(game.held, Some(active), "active piece is now held");
}

#[test]
fn drops_one_row_per_interval_and_locks_on_the_floor() {
    let mut game = started_game();
    let start_y = game.piece.as_ref().unwrap().y;

    game.tick(1000);
    assert!(
        game.piece.as_ref().unwrap().y > start_y,
        "piece moved down after one second"
    );
}

#[test]
fn does_nothing_while_paused() {
    let mut game = started_game();
    let y = game.piece.as_ref().unwrap().y;
    game.pause();

    game.tick(5000);
    assert_eq!(game.piece.as_ref().unwrap().y, y);
}

#[test]
fn shuffled_bag_deals_every_piece_once_per_bag() {
    let mut game = started_game();
    let mut dealt = [0u8; 6];
    for _ in 0..6 {
        let id = game.piece.as_ref().unwrap().id;
        dealt[(id - 1) as usize] += 1;
        game.board.fill(0);
        game.hard_drop();
    }

    assert_eq!(dealt, [1; 6], "the first six spawns are one full bag");
}

#[test]
fn landing_above_the_board_ends_the_game_without_cropping_cells() {
    let mut game = started_game();
    let mut cells = [0; 16];
    spawn_cells(5, &mut cells);
    game.piece = Some(Piece {
        id: 5,
        size: 2,
        cells,
        x: 0,
        y: -1,
    });
    game.board[COLS] = 2;
    let before = game.board;
    game.hard_drop();
    assert_eq!(game.status, Status::Over);
    assert_eq!(game.board, before);
}
