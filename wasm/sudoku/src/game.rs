use crate::puzzle::{ALL_DIGITS, CELLS, Puzzle, SEARCH_BUDGET, box_of, solve};

#[derive(Clone)]
pub struct Game {
    pub givens: [u8; CELLS],
    pub values: [u8; CELLS],
    solution: [u8; CELLS],
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub struct Hint {
    pub kind: u8,
    pub index: u8,
    pub value: u8,
    pub unit: u8,
}

pub const NO_HINT: Hint = Hint {
    kind: 0,
    index: 0,
    value: 0,
    unit: 0,
};

impl Game {
    pub const EMPTY: Self = Self {
        givens: [0; CELLS],
        values: [0; CELLS],
        solution: [0; CELLS],
    };

    pub fn new(puzzle: Puzzle) -> Self {
        Self {
            givens: puzzle.givens,
            values: puzzle.givens,
            solution: puzzle.solution,
        }
    }

    pub fn set(&mut self, index: usize, value: u8) -> bool {
        if self.solution[0] == 0 || index >= CELLS || value > 9 || self.givens[index] != 0 {
            return false;
        }
        self.values[index] = value;
        true
    }

    pub fn candidates(&self, index: usize) -> u16 {
        if self.solution[0] == 0 {
            return 0;
        }
        candidates(&self.values, index)
    }

    pub fn conflicts(&self) -> [u8; CELLS] {
        let mut flags = [0; CELLS];
        for (index, value) in self.values.iter().enumerate() {
            if *value == 0 {
                continue;
            }
            flags[index] = u8::from(
                self.values
                    .iter()
                    .enumerate()
                    .any(|(other, digit)| index != other && value == digit && peers(index, other)),
            );
        }
        flags
    }

    pub fn complete(&self) -> bool {
        self.solution[0] != 0 && self.values == self.solution
    }

    pub fn hint(&self) -> Hint {
        if self.solution[0] == 0 {
            return NO_HINT;
        }
        if let Some(index) = self
            .values
            .iter()
            .enumerate()
            .position(|(index, value)| *value != 0 && *value != self.solution[index])
        {
            return Hint {
                kind: 5,
                index: index as u8,
                value: 0,
                unit: 0,
            };
        }
        if let Some(hint) = logical_hint(&self.values) {
            return hint;
        }
        if let Some(index) = self.values.iter().position(|value| *value == 0) {
            return Hint {
                kind: 6,
                index: index as u8,
                value: self.solution[index],
                unit: 0,
            };
        }
        NO_HINT
    }

    pub fn restore(givens: [u8; CELLS], values: [u8; CELLS]) -> Option<Self> {
        if givens.iter().filter(|value| **value != 0).count() < 24 {
            return None;
        }
        if givens
            .iter()
            .zip(values)
            .any(|(given, value)| *given > 9 || value > 9 || (*given != 0 && *given != value))
        {
            return None;
        }
        let result = solve(&givens, SEARCH_BUDGET);
        if result.count != 1 || result.exhausted {
            return None;
        }
        Some(Self {
            givens,
            values,
            solution: result.first,
        })
    }
}

fn peers(first: usize, second: usize) -> bool {
    first / 9 == second / 9 || first % 9 == second % 9 || box_of(first) == box_of(second)
}

fn candidates(values: &[u8; CELLS], index: usize) -> u16 {
    if index >= CELLS || values[index] != 0 {
        return 0;
    }
    let mut mask = ALL_DIGITS;
    for (other, value) in values.iter().enumerate() {
        if *value != 0 && peers(index, other) {
            mask &= !(1 << (*value - 1));
        }
    }
    mask
}

fn unit_cell(kind: u8, unit: u8, offset: usize) -> usize {
    let unit = unit as usize;
    match kind {
        2 => unit * 9 + offset,
        3 => offset * 9 + unit,
        _ => unit / 3 * 27 + unit % 3 * 3 + offset / 3 * 9 + offset % 3,
    }
}

fn hidden_single(values: &[u8; CELLS], kind: u8, unit: u8) -> Option<Hint> {
    for value in 1..=9 {
        let mut only = None;
        let mut count = 0;
        for offset in 0..9 {
            let index = unit_cell(kind, unit, offset);
            if candidates(values, index) & (1 << (value - 1)) != 0 {
                only = Some(index);
                count += 1;
            }
        }
        if count == 1 {
            return Some(Hint {
                kind,
                index: only.unwrap() as u8,
                value,
                unit,
            });
        }
    }
    None
}

fn logical_hint(values: &[u8; CELLS]) -> Option<Hint> {
    for index in 0..CELLS {
        let mask = candidates(values, index);
        if mask.count_ones() == 1 {
            return Some(Hint {
                kind: 1,
                index: index as u8,
                value: mask.trailing_zeros() as u8 + 1,
                unit: 0,
            });
        }
    }
    for kind in 2..=4 {
        for unit in 0..9 {
            if let Some(hint) = hidden_single(values, kind, unit) {
                return Some(hint);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests;
