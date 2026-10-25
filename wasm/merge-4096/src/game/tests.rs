use super::*;
use crate::rules::MAX_TILE;

fn game(cells: [u32; CELLS]) -> Game {
    Game::restore(cells, 0.0, 0, 42).unwrap()
}

#[test]
fn new_games_have_two_seeded_random_tiles() {
    for seed in [0, 1, 42, u32::MAX] {
        let game = Game::new(seed);
        assert_eq!(game.cells.iter().filter(|tile| **tile != 0).count(), 2);
        assert!(game.cells.iter().all(|tile| [0, 2, 4].contains(tile)));
        assert_eq!(game.score, 0);
        assert_eq!(game.moves, 0);
        assert_ne!(game.rng, 0);
        assert_eq!(game, Game::new(seed));
    }
    assert_ne!(Game::new(42), Game::new(43));
}

#[test]
fn changed_moves_score_then_spawn_exactly_one_tile() {
    let mut game = game([2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert!(game.move_to(0));
    assert_eq!(&game.cells[..2], &[4, 4]);
    assert_eq!(game.cells.iter().filter(|tile| **tile != 0).count(), 3);
    assert_eq!(game.score, 8);
    assert_eq!(game.moves, 1);
    assert_ne!(game.rng, 42);
    let spawned: Vec<u32> = game.cells[2..]
        .iter()
        .copied()
        .filter(|tile| *tile != 0)
        .collect();
    assert!(spawned == [2] || spawned == [4]);
}

#[test]
fn noop_and_invalid_directions_preserve_every_state_field() {
    let mut game = game([2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let before = game.clone();
    for direction in [0, 4, u32::MAX] {
        assert!(!game.move_to(direction));
        assert_eq!(game, before);
    }
}

#[test]
fn winning_allows_continued_play_and_game_over_requires_no_legal_move() {
    let mut game = game([2048, 2048, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    assert!(!game.won());
    assert!(game.move_to(0));
    assert!(game.won());
    assert!(!game.over());
    assert!(game.move_to(2));
    assert!(game.won());
    let blocked = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
    assert!(self::game(blocked).over());
    let mut mergeable = blocked;
    mergeable[1] = 2;
    assert!(!self::game(mergeable).over());
    let mut capped = blocked;
    capped[0] = MAX_TILE;
    capped[1] = MAX_TILE;
    assert!(self::game(capped).over(), "equal capped tiles cannot merge");
}

#[test]
fn restore_preserves_rng_and_replays_the_same_future_moves() {
    let mut original = Game::new(104);
    for direction in [0, 1, 2, 3, 0] {
        original.move_to(direction);
    }
    let mut restored = Game::restore(
        original.cells,
        original.score as f64,
        original.moves,
        original.rng,
    )
    .unwrap();
    for direction in [1, 3, 2, 0, 3] {
        assert_eq!(original.move_to(direction), restored.move_to(direction));
        assert_eq!(original, restored);
    }
}

#[test]
fn restore_rejects_invalid_cells_scores_and_rng() {
    let valid = [2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for value in [1, 3, u32::MAX] {
        let mut cells = valid;
        cells[0] = value;
        assert!(Game::restore(cells, 0.0, 0, 1).is_none());
    }
    for score in [
        -1.0,
        0.5,
        f64::NAN,
        f64::INFINITY,
        f64::NEG_INFINITY,
        MAX_SCORE as f64 + 1.0,
    ] {
        assert!(Game::restore(valid, score, 0, 1).is_none());
    }
    assert!(Game::restore(valid, 0.0, 0, 0).is_none());
    assert!(Game::restore([0; CELLS], 0.0, 0, 1).is_none());
    let mut single = [0; CELLS];
    single[0] = 2;
    assert!(Game::restore(single, 0.0, 0, 1).is_none());
}

#[test]
fn counter_caps_preserve_legal_moves_and_do_not_overflow() {
    let cells = [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mut game = Game::restore(cells, MAX_SCORE as f64, u32::MAX, 42).unwrap();
    assert!(game.move_to(0));
    assert_eq!(game.score, MAX_SCORE);
    assert_eq!(game.moves, u32::MAX);
    assert!(!game.over());
    let cells = [MAX_TILE, MAX_TILE, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mut game = self::game(cells);
    assert!(game.won());
    assert!(game.move_to(0));
    assert_eq!(&game.cells[..3], &[MAX_TILE, MAX_TILE, 4]);
}
