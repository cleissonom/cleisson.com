use super::*;
use crate::fixtures::{CLASSIC, SOLUTION};

// Exported state is global, so one combined test prevents parallel ABI calls.
#[test]
fn the_abi_exports_live_regions_and_rejected_imports_preserve_the_current_game() {
    assert_eq!(sudoku_version(), 1);
    let base = sudoku_givens_ptr();
    assert_eq!(sudoku_values_ptr().wrapping_sub(base), 81);
    assert_eq!(sudoku_conflicts_ptr().wrapping_sub(base), 162);
    assert_eq!(sudoku_hint_ptr().wrapping_sub(base), 243);
    assert_eq!(sudoku_input_ptr().wrapping_sub(base), 247);
    assert_eq!(sudoku_generate(42, 0), 1);
    assert_eq!(
        engine()
            .shared
            .givens
            .iter()
            .filter(|value| **value != 0)
            .count(),
        42
    );
    let before = engine().shared.values;
    assert_eq!(sudoku_generate(42, 3), 0);
    assert_eq!(engine().shared.values, before);
    assert_eq!(sudoku_set(256, 1), 0);
    assert_eq!(sudoku_set(0, 256), 0);
    engine().shared.input[..CELLS].copy_from_slice(&CLASSIC);
    engine().shared.input[CELLS..].copy_from_slice(&CLASSIC);
    assert_eq!(sudoku_restore(), 1);
    assert_eq!(sudoku_candidates(2), 11);
    assert_eq!(sudoku_set(0, 0), 0);
    assert_eq!(sudoku_set(2, 5), 1);
    assert_eq!(engine().shared.conflicts[0], 1);
    assert_eq!(engine().shared.conflicts[2], 1);
    assert_eq!(sudoku_hint(), 5);
    assert_eq!(engine().shared.hint, [5, 2, 0, 0]);
    engine().shared.input.fill(0);
    assert_eq!(sudoku_restore(), 0);
    assert_eq!(
        engine().shared.values[2],
        5,
        "rejection preserves live values"
    );
    assert_eq!(
        engine().shared.hint,
        [5, 2, 0, 0],
        "rejection preserves hints"
    );
    for (index, value) in SOLUTION.iter().enumerate() {
        if CLASSIC[index] == 0 {
            assert_eq!(sudoku_set(index as u32, *value as u32), 1);
        }
    }
    assert_eq!(sudoku_complete(), 1);
    assert_eq!(sudoku_hint(), 0);
}
