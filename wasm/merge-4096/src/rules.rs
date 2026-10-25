pub const CELLS: usize = 16;
pub const MAX_TILE: u32 = 1 << 31;

#[derive(Debug, PartialEq)]
pub struct Shift {
    pub cells: [u32; CELLS],
    pub points: u64,
}

fn slide_line(line: [u32; 4]) -> ([u32; 4], u64) {
    let mut packed = [0; 4];
    let mut count = 0;
    for tile in line.into_iter().filter(|tile| *tile != 0) {
        packed[count] = tile;
        count += 1;
    }
    let mut result = [0; 4];
    let (mut read, mut write, mut points) = (0, 0, 0);
    while read < count {
        let tile = packed[read];
        if read + 1 < count && tile == packed[read + 1] && tile < MAX_TILE {
            result[write] = tile * 2;
            points += u64::from(tile * 2);
            read += 2;
        } else {
            result[write] = tile;
            read += 1;
        }
        write += 1;
    }
    (result, points)
}

fn cell_index(direction: u32, line: usize, offset: usize) -> usize {
    match direction {
        0 => line * 4 + offset,
        1 => offset * 4 + line,
        2 => line * 4 + 3 - offset,
        _ => (3 - offset) * 4 + line,
    }
}

/// Apply compression and one merge per original tile, without random spawning.
/// 2^31 is the largest tile in the ABI; two such tiles remain separate.
pub fn shift(cells: &[u32; CELLS], direction: u32) -> Option<Shift> {
    if direction > 3 {
        return None;
    }
    let mut result = Shift {
        cells: [0; CELLS],
        points: 0,
    };
    for line in 0..4 {
        let before = std::array::from_fn(|offset| cells[cell_index(direction, line, offset)]);
        let (after, points) = slide_line(before);
        result.points += points;
        for (offset, tile) in after.into_iter().enumerate() {
            result.cells[cell_index(direction, line, offset)] = tile;
        }
    }
    Some(result)
}

#[cfg(test)]
mod tests;
