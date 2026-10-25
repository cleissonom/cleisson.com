use super::*;

// One combined test owns the global ABI; pure game/rule tests have local state.
#[test]
fn exported_regions_and_rejected_restores_preserve_live_game_state() {
    assert_eq!(game4096_version(), 1);
    assert_eq!(game4096_cells_ptr() % 4, 0);
    assert_eq!(game4096_input_ptr().wrapping_sub(game4096_cells_ptr()), 64);
    assert_eq!(game4096_new(42), 1);
    assert_eq!(
        engine()
            .shared
            .cells
            .iter()
            .filter(|tile| **tile != 0)
            .count(),
        2
    );
    let before = engine().game.clone();
    engine().shared.input.fill(0);
    assert_eq!(game4096_restore(0.0, 0, 1), 0);
    assert_eq!(engine().game, before);
    assert_eq!(engine().shared.cells, before.cells);
    engine().shared.input = [2048, 2048, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    assert_eq!(game4096_restore(100.0, 3, 42), 1);
    assert_eq!(game4096_move(0), 1);
    assert_eq!(game4096_score(), 4196.0);
    assert_eq!(game4096_moves(), 4);
    assert_eq!(game4096_won(), 1);
    assert_eq!(game4096_over(), 0);
    let rng = game4096_rng();
    assert_eq!(game4096_move(256), 0);
    assert_eq!(game4096_rng(), rng);
    assert_eq!(game4096_moves(), 4);
}
