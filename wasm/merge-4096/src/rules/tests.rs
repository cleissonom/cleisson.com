use super::*;

#[test]
fn compresses_gaps_and_merges_each_original_tile_only_once() {
    for (before, after, points) in [
        ([2, 2, 2, 2], [4, 4, 0, 0], 8),
        ([4, 4, 8, 0], [8, 8, 0, 0], 8),
        ([2, 0, 2, 2], [4, 2, 0, 0], 4),
        ([0, 2, 0, 4], [2, 4, 0, 0], 0),
        ([2, 4, 8, 16], [2, 4, 8, 16], 0),
        ([0; 4], [0; 4], 0),
    ] {
        assert_eq!(slide_line(before), (after, points));
        assert_eq!(
            before.iter().map(|tile| u64::from(*tile)).sum::<u64>(),
            after.iter().map(|tile| u64::from(*tile)).sum::<u64>()
        );
    }
}

#[test]
fn applies_all_four_directions_without_spawning() {
    let cells = [2, 0, 2, 0, 0, 4, 0, 0, 2, 0, 0, 2, 0, 4, 0, 0];
    for (direction, expected, points) in [
        (0, [4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0], 8),
        (1, [4, 8, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 12),
        (2, [0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 4], 8),
        (3, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 2, 2], 12),
    ] {
        assert_eq!(
            shift(&cells, direction),
            Some(Shift {
                cells: expected,
                points
            })
        );
    }
    assert!(shift(&cells, 4).is_none());
}

#[test]
fn maximum_tiles_stay_separate_while_other_pairs_can_merge() {
    assert_eq!(
        slide_line([MAX_TILE, MAX_TILE, 2, 2]),
        ([MAX_TILE, MAX_TILE, 4, 0], 4)
    );
    assert_eq!(
        slide_line([MAX_TILE / 2, MAX_TILE / 2, MAX_TILE, 0]),
        ([MAX_TILE, MAX_TILE, 0, 0], u64::from(MAX_TILE))
    );
}
