use super::*;
use crate::fixtures::{CLASSIC, SOLUTION};

fn classic() -> Game {
    Game::new(Puzzle {
        givens: CLASSIC,
        solution: SOLUTION,
    })
}

#[test]
fn givens_are_immutable_and_editable_values_can_be_changed_or_cleared() {
    let mut game = classic();
    assert!(!game.set(0, 0));
    assert!(!game.set(0, 5));
    assert_eq!(game.values[0], 5);
    assert!(game.set(2, 1));
    assert_eq!(game.values[2], 1);
    assert!(game.set(2, 1), "an unchanged editable value is accepted");
    assert!(game.set(2, 0));
    assert!(!game.set(81, 1));
    assert!(!game.set(2, 10));
    assert_eq!(game.givens, CLASSIC);
}

#[test]
fn candidates_exclude_every_row_column_and_box_digit() {
    let mut game = classic();
    assert_eq!(game.candidates(2), 0b000_001_011, "digits 1, 2 and 4 fit");
    assert_eq!(game.candidates(0), 0, "a given is already filled");
    assert_eq!(game.candidates(81), 0);
    game.set(2, 4);
    assert_eq!(game.candidates(2), 0);
}

#[test]
fn duplicate_entries_are_allowed_and_every_conflicting_peer_is_flagged() {
    let mut game = Game::new(Puzzle {
        givens: [0; CELLS],
        solution: SOLUTION,
    });
    for index in [0, 1, 9, 10] {
        assert!(game.set(index, 5));
    }
    let flags = game.conflicts();
    assert_eq!(flags.iter().filter(|flag| **flag != 0).count(), 4);
    assert!([0, 1, 9, 10].into_iter().all(|index| flags[index] == 1));
    game.set(1, 0);
    assert_eq!(game.conflicts()[1], 0);
    let mut game = classic();
    assert!(game.set(2, 5));
    assert_eq!(game.conflicts()[0], 1, "include the duplicate given");
    assert_eq!(game.conflicts()[2], 1);
}

#[test]
fn completion_requires_the_full_correct_grid() {
    assert!(!Game::EMPTY.complete());
    let mut game = classic();
    assert!(!game.complete());
    for (index, value) in SOLUTION.iter().enumerate() {
        if game.givens[index] == 0 {
            game.set(index, *value);
        }
    }
    assert!(game.complete());
    game.set(2, 1);
    assert!(
        !game.complete(),
        "a full but incorrect grid is not complete"
    );
    game.set(2, 0);
    assert!(!game.complete());
}

#[test]
fn hints_correct_wrong_entries_before_offering_an_explained_single() {
    let mut game = classic();
    game.set(2, 1);
    assert_eq!(
        game.hint(),
        Hint {
            kind: 5,
            index: 2,
            value: 0,
            unit: 0
        }
    );
    assert_eq!(game.values[2], 1, "a hint is advisory until applied");
    let mut givens = SOLUTION;
    givens[0] = 0;
    let game = Game::new(Puzzle {
        givens,
        solution: SOLUTION,
    });
    assert_eq!(
        game.hint(),
        Hint {
            kind: 1,
            index: 0,
            value: 5,
            unit: 0
        }
    );
}

#[test]
fn hidden_singles_report_their_row_column_or_box() {
    let mut values = [0; CELLS];
    for (index, digit) in SOLUTION.iter().enumerate() {
        if *digit == 1 && index / 9 != 0 {
            values[index] = 1;
        }
    }
    for (kind, unit) in [(2, 0), (3, 7), (4, 2)] {
        assert_eq!(
            hidden_single(&values, kind, unit),
            Some(Hint {
                kind,
                index: 7,
                value: 1,
                unit
            })
        );
    }
}

#[test]
fn reveal_fallback_is_distinguished_from_logic_and_completed_games_have_no_hint() {
    let game = Game::new(Puzzle {
        givens: [0; CELLS],
        solution: SOLUTION,
    });
    assert_eq!(
        game.hint(),
        Hint {
            kind: 6,
            index: 0,
            value: 5,
            unit: 0
        }
    );
    let game = Game::new(Puzzle {
        givens: SOLUTION,
        solution: SOLUTION,
    });
    assert_eq!(game.hint(), NO_HINT);
    assert_eq!(Game::EMPTY.hint(), NO_HINT);
}

#[test]
fn restore_accepts_a_unique_puzzle_and_preserves_wrong_editable_entries() {
    let mut values = CLASSIC;
    values[2] = 5;
    let game = Game::restore(CLASSIC, values).unwrap();
    assert_eq!(game.values, values);
    assert_eq!(game.givens, CLASSIC);
    assert_eq!(game.solution, SOLUTION);
    assert_eq!(game.conflicts()[2], 1);
}

#[test]
fn restore_rejects_malformed_givens_values_and_nonunique_puzzles() {
    assert!(Game::restore([0; CELLS], [0; CELLS]).is_none());
    let mut givens = CLASSIC;
    givens[2] = 10;
    assert!(Game::restore(givens, givens).is_none());
    givens[2] = 5;
    assert!(Game::restore(givens, givens).is_none());
    let mut values = CLASSIC;
    values[2] = 10;
    assert!(Game::restore(CLASSIC, values).is_none());
    values[2] = 0;
    values[0] = 0;
    assert!(Game::restore(CLASSIC, values).is_none());
    let mut multiple = [0; CELLS];
    multiple[..27].copy_from_slice(&SOLUTION[..27]);
    assert!(
        Game::restore(multiple, multiple).is_none(),
        "27 valid clues can have multiple solutions"
    );
}
