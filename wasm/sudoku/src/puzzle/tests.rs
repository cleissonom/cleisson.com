use super::*;
use crate::fixtures::{CLASSIC, SOLUTION};

fn digit_set(values: impl Iterator<Item = u8>) -> u16 {
    values.fold(0, |bits, value| bits | 1 << (value - 1))
}

fn assert_solution(grid: &[u8; CELLS]) {
    assert!(grid.iter().all(|value| (1..=9).contains(value)));
    for unit in 0..9 {
        assert_eq!(
            digit_set((0..9).map(|col| grid[unit * 9 + col])),
            ALL_DIGITS
        );
        assert_eq!(
            digit_set((0..9).map(|row| grid[row * 9 + unit])),
            ALL_DIGITS
        );
        let start = unit / 3 * 27 + unit % 3 * 3;
        assert_eq!(
            digit_set((0..9).map(|cell| grid[start + cell / 3 * 9 + cell % 3])),
            ALL_DIGITS
        );
    }
}

#[test]
fn solves_a_unique_puzzle_and_detects_invalid_or_multiple_solutions() {
    let unique = solve(&CLASSIC, SEARCH_BUDGET);
    assert_eq!(unique.count, 1);
    assert!(!unique.exhausted);
    assert_eq!(unique.first, SOLUTION);
    let multiple = solve(&[0; CELLS], SEARCH_BUDGET);
    assert_eq!(multiple.count, 2, "stop after finding a second solution");
    assert!(!multiple.exhausted);
    let mut duplicate = CLASSIC;
    duplicate[2] = 5;
    assert_eq!(solve(&duplicate, SEARCH_BUDGET).count, 0);
    duplicate[2] = 10;
    assert_eq!(solve(&duplicate, SEARCH_BUDGET).count, 0);
}

#[test]
fn exhausted_search_never_reports_proven_uniqueness() {
    let result = solve(&[0; CELLS], 1);
    assert!(result.exhausted);
    assert_ne!(result.count, 1);
}

#[test]
fn generated_puzzles_are_unique_at_every_clue_target() {
    for seed in [0, 1, 2, 42, 104, 123_456, u32::MAX] {
        for (difficulty, clues) in [42, 35, 29].into_iter().enumerate() {
            let puzzle = generate(seed, difficulty as u32).expect("generation succeeds");
            assert_eq!(
                puzzle.givens.iter().filter(|value| **value != 0).count(),
                clues
            );
            assert_solution(&puzzle.solution);
            let solved = solve(&puzzle.givens, SEARCH_BUDGET);
            assert_eq!(solved.count, 1, "seed {seed}, difficulty {difficulty}");
            assert!(!solved.exhausted);
            assert_eq!(solved.first, puzzle.solution);
            assert!(
                puzzle
                    .givens
                    .iter()
                    .zip(puzzle.solution)
                    .all(|(given, value)| *given == 0 || *given == value)
            );
        }
    }
}

#[test]
fn seeds_are_repeatable_and_invalid_difficulties_are_rejected() {
    let first = generate(42, 1).unwrap();
    let repeat = generate(42, 1).unwrap();
    assert_eq!(first.givens, repeat.givens);
    assert_ne!(first.givens, generate(43, 1).unwrap().givens);
    assert!(generate(42, 3).is_none());
}
