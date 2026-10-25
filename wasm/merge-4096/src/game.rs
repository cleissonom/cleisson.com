use crate::rules::{CELLS, MAX_TILE, shift};

pub const MAX_SCORE: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq)]
pub struct Game {
    pub cells: [u32; CELLS],
    pub score: u64,
    pub moves: u32,
    pub rng: u32,
}

impl Game {
    pub const EMPTY: Self = Self {
        cells: [0; CELLS],
        score: 0,
        moves: 0,
        rng: 1,
    };
    pub fn new(seed: u32) -> Self {
        let mut game = Self {
            rng: seed.max(1),
            ..Self::EMPTY
        };
        game.spawn();
        game.spawn();
        game
    }

    pub fn move_to(&mut self, direction: u32) -> bool {
        let Some(next) = shift(&self.cells, direction) else {
            return false;
        };
        if next.cells == self.cells {
            return false;
        }
        self.cells = next.cells;
        self.score = self.score.saturating_add(next.points).min(MAX_SCORE);
        self.moves = self.moves.saturating_add(1);
        self.spawn();
        true
    }

    fn random(&mut self) -> u32 {
        self.rng ^= self.rng << 13;
        self.rng ^= self.rng >> 17;
        self.rng ^= self.rng << 5;
        self.rng
    }

    fn spawn(&mut self) {
        let mut empty = [0; CELLS];
        let mut count = 0;
        for (index, tile) in self.cells.iter().enumerate() {
            if *tile == 0 {
                empty[count] = index;
                count += 1;
            }
        }
        if count == 0 {
            return;
        }
        let index = empty[self.random() as usize % count];
        self.cells[index] = if self.random().is_multiple_of(10) {
            4
        } else {
            2
        };
    }

    pub fn won(&self) -> bool {
        self.cells.iter().any(|tile| *tile >= 4096)
    }

    pub fn over(&self) -> bool {
        (0..4).all(|direction| shift(&self.cells, direction).unwrap().cells == self.cells)
    }

    pub fn restore(cells: [u32; CELLS], score: f64, moves: u32, rng: u32) -> Option<Self> {
        if rng == 0
            || !score.is_finite()
            || score < 0.0
            || score > MAX_SCORE as f64
            || score.fract() != 0.0
        {
            return None;
        }
        if cells.iter().filter(|tile| **tile != 0).count() < 2 {
            return None;
        }
        if cells
            .iter()
            .any(|tile| *tile != 0 && (*tile < 2 || *tile > MAX_TILE || !tile.is_power_of_two()))
        {
            return None;
        }
        Some(Self {
            cells,
            score: score as u64,
            moves,
            rng,
        })
    }
}

#[cfg(test)]
mod tests;
