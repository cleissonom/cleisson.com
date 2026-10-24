pub const CELLS: usize = 81;
pub const ALL_DIGITS: u16 = 0x1ff;
pub const SEARCH_BUDGET: u32 = 100_000;

pub struct Puzzle {
    pub givens: [u8; CELLS],
    pub solution: [u8; CELLS],
}

pub struct Solutions {
    pub count: u8,
    pub first: [u8; CELLS],
    pub exhausted: bool,
}

pub fn box_of(index: usize) -> usize {
    index / 27 * 3 + index % 9 / 3
}

#[derive(Default)]
struct Masks {
    rows: [u16; 9],
    cols: [u16; 9],
    boxes: [u16; 9],
}

impl Masks {
    fn candidates(&self, index: usize) -> u16 {
        ALL_DIGITS & !(self.rows[index / 9] | self.cols[index % 9] | self.boxes[box_of(index)])
    }

    fn toggle(&mut self, index: usize, bit: u16) {
        self.rows[index / 9] ^= bit;
        self.cols[index % 9] ^= bit;
        self.boxes[box_of(index)] ^= bit;
    }
}

fn initial_masks(grid: &[u8; CELLS]) -> Option<Masks> {
    let mut masks = Masks::default();
    for (index, value) in grid.iter().copied().enumerate() {
        if value == 0 {
            continue;
        }
        if value > 9 || masks.candidates(index) & (1 << (value - 1)) == 0 {
            return None;
        }
        masks.toggle(index, 1 << (value - 1));
    }
    Some(masks)
}

fn next_cell(grid: &[u8; CELLS], masks: &Masks) -> Option<(usize, u16)> {
    let mut best = None;
    let mut fewest = 10;
    for (index, value) in grid.iter().enumerate() {
        if *value != 0 {
            continue;
        }
        let candidates = masks.candidates(index);
        let count = candidates.count_ones();
        if count < fewest {
            best = Some((index, candidates));
            fewest = count;
            if count <= 1 {
                break;
            }
        }
    }
    best
}

fn search(grid: &mut [u8; CELLS], masks: &mut Masks, remaining: &mut u32, found: &mut Solutions) {
    if *remaining == 0 {
        found.exhausted = true;
        return;
    }
    *remaining -= 1;
    let Some((index, mut candidates)) = next_cell(grid, masks) else {
        found.count += 1;
        if found.count == 1 {
            found.first = *grid;
        }
        return;
    };
    while candidates != 0 && found.count < 2 && !found.exhausted {
        let digit = candidates.trailing_zeros();
        let bit = 1 << digit;
        candidates &= !bit;
        grid[index] = digit as u8 + 1;
        masks.toggle(index, bit);
        search(grid, masks, remaining, found);
        masks.toggle(index, bit);
        grid[index] = 0;
    }
}

/// Count at most two solutions; exhaustion must never be treated as uniqueness.
pub fn solve(grid: &[u8; CELLS], budget: u32) -> Solutions {
    let mut result = Solutions {
        count: 0,
        first: [0; CELLS],
        exhausted: false,
    };
    if let Some(mut masks) = initial_masks(grid) {
        let mut working = *grid;
        let mut remaining = budget;
        search(&mut working, &mut masks, &mut remaining, &mut result);
    }
    result
}

struct Random(u32);

impl Random {
    fn next(&mut self) -> u32 {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 17;
        self.0 ^= self.0 << 5;
        self.0
    }

    fn shuffle<T>(&mut self, values: &mut [T]) {
        for index in (1..values.len()).rev() {
            let other = self.next() as usize % (index + 1);
            values.swap(index, other);
        }
    }
}

/// Permute bands/stacks and rows/columns within them, preserving a valid grid.
fn axis(random: &mut Random) -> [usize; 9] {
    let mut groups = [0, 1, 2];
    random.shuffle(&mut groups);
    let mut result = [0; 9];
    for (group, original) in groups.iter().enumerate() {
        let mut within = [0, 1, 2];
        random.shuffle(&mut within);
        for offset in 0..3 {
            result[group * 3 + offset] = original * 3 + within[offset];
        }
    }
    result
}

fn solved_grid(random: &mut Random) -> [u8; CELLS] {
    let rows = axis(random);
    let cols = axis(random);
    let mut digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    random.shuffle(&mut digits);
    let mut grid = [0; CELLS];
    for index in 0..CELLS {
        let row = rows[index / 9];
        grid[index] = digits[(row * 3 + row / 3 + cols[index % 9]) % 9];
    }
    grid
}

fn remove_clues(solution: [u8; CELLS], target: usize, random: &mut Random) -> Option<Puzzle> {
    let mut givens = solution;
    let mut order = std::array::from_fn::<_, CELLS, _>(|index| index);
    random.shuffle(&mut order);
    let mut clues = CELLS;
    for index in order {
        let previous = givens[index];
        givens[index] = 0;
        let result = solve(&givens, SEARCH_BUDGET);
        if result.count == 1 && !result.exhausted {
            clues -= 1;
            if clues == target {
                return Some(Puzzle { givens, solution });
            }
        } else {
            givens[index] = previous;
        }
    }
    None
}

/// Difficulty labels describe clue counts, not a human solving-strategy grade.
pub fn generate(seed: u32, difficulty: u32) -> Option<Puzzle> {
    let target = *[42, 35, 29].get(difficulty as usize)?;
    let mut random = Random((seed ^ 0x9e37_79b9).max(1));
    for _ in 0..16 {
        if let Some(puzzle) = remove_clues(solved_grid(&mut random), target, &mut random) {
            return Some(puzzle);
        }
    }
    None
}

#[cfg(test)]
mod tests;
