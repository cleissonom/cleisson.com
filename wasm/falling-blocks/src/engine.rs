//! Seeded falling-block state machine, independent of its browser host.

use self::rand::Rng;
use crate::rules::{
    BOARD_SIZE, COLS, KICKS, PIECE_IDS, QUEUE_SIZE, collides, drop_interval, ghost_row,
    level_for_lines, lock_piece, resolve_lines, rotate_cells, spawn_cells, spawn_size,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Status {
    Ready = 0,
    Playing = 1,
    Paused = 2,
    Over = 3,
}

#[derive(Clone, Copy, Debug)]
pub struct Piece {
    pub id: u8,
    pub size: usize,
    pub cells: [u8; 16],
    pub x: i8,
    pub y: i8,
}

pub struct Game {
    pub(crate) board: [u8; BOARD_SIZE],
    pub(crate) piece: Option<Piece>,
    pub(crate) held: Option<u8>,
    pub(crate) can_hold: bool,
    pub(crate) queue: [u8; QUEUE_SIZE],
    pub(crate) score: u32,
    pub(crate) lines: u32,
    pub(crate) level: u32,
    pub(crate) drop_timer: u32,
    pub(crate) status: Status,
    rng: Rng,
    bag: [u8; PIECE_IDS.len()],
    bag_len: usize,
}

impl Game {
    /// A fresh ready-to-start game whose randomiser is seeded by the
    /// JavaScript host for reproducibility.
    pub fn new(seed: u64) -> Self {
        let mut game = Self {
            board: [0; BOARD_SIZE],
            piece: None,
            held: None,
            can_hold: true,
            queue: [0; QUEUE_SIZE],
            score: 0,
            lines: 0,
            level: 1,
            drop_timer: 0,
            status: Status::Ready,
            rng: Rng::new(seed),
            bag: [0; PIECE_IDS.len()],
            bag_len: 0,
        };
        game.refill_queue();
        game
    }

    /// Keeps the seeded randomiser running across restarts, between games.
    pub fn reset(&mut self) {
        self.board = [0; BOARD_SIZE];
        self.piece = None;
        self.held = None;
        self.can_hold = true;
        self.queue = [0; QUEUE_SIZE];
        self.score = 0;
        self.lines = 0;
        self.level = 1;
        self.drop_timer = 0;
        self.status = Status::Ready;
        self.bag_len = 0;
        self.refill_queue();
    }

    /// Starts a run: fresh board plus the first piece from the queue.
    pub fn start(&mut self) {
        if self.status != Status::Ready {
            self.reset();
        }
        self.status = Status::Playing;
        let first = self.pull_queue();
        self.spawn(first);
        self.refill_queue();
    }

    /// Pauses and resumes; other states stay untouched, without changing idle states.
    pub fn pause(&mut self) {
        match self.status {
            Status::Playing => self.status = Status::Paused,
            Status::Paused => self.status = Status::Playing,
            _ => {}
        }
    }

    /// Moves the active piece sideways, returning whether the move applied.
    pub fn move_sideways(&mut self, dx: i8) -> bool {
        if !self.is_active() {
            return false;
        }
        let Some(piece) = self.piece else {
            return false;
        };
        if collides(&self.board, &piece.cells, piece.size, piece.x + dx, piece.y) {
            return false;
        }
        self.piece = Some(Piece {
            x: piece.x + dx,
            ..piece
        });
        true
    }

    /// Rotates with the shared wall-kick table; returns whether it applied.
    pub fn rotate(&mut self, direction: i8) -> bool {
        if !self.is_active() {
            return false;
        }
        let Some(piece) = self.piece else {
            return false;
        };
        let rotated = rotate_cells(&piece.cells, piece.size, direction);
        let Some((dx, dy)) = KICKS.iter().copied().find(|(dx, dy)| {
            !collides(
                &self.board,
                &rotated,
                piece.size,
                piece.x + dx,
                piece.y + dy,
            )
        }) else {
            return false;
        };
        self.piece = Some(Piece {
            cells: rotated,
            x: piece.x + dx,
            y: piece.y + dy,
            ..piece
        });
        true
    }

    /// Drops one row if free, otherwise locks the piece. Scores a point.
    pub fn soft_drop(&mut self) -> bool {
        if !self.is_active() {
            return false;
        }
        let Some(piece) = self.piece else {
            return false;
        };
        if collides(&self.board, &piece.cells, piece.size, piece.x, piece.y + 1) {
            self.land();
            return true;
        }
        self.piece = Some(Piece {
            y: piece.y + 1,
            ..piece
        });
        self.score += 1;
        true
    }

    /// Slams the piece onto its ghost row, scoring two points per row saved.
    pub fn hard_drop(&mut self) -> bool {
        if !self.is_active() {
            return false;
        }
        let Some(piece) = self.piece else {
            return false;
        };
        let target = ghost_row(&self.board, &piece.cells, piece.size, piece.x, piece.y);
        self.score += 2 * u32::from((target - piece.y) as u8);
        self.piece = Some(Piece { y: target, ..piece });
        self.land();
        true
    }

    /// Swaps the active piece with the hold slot once per locked piece.
    pub fn hold(&mut self) -> bool {
        if !self.is_active() || !self.can_hold {
            return false;
        }
        let Some(active) = self.piece.as_ref().map(|piece| piece.id) else {
            return false;
        };
        let swap_back = self.held.replace(active);
        match swap_back {
            None => {
                let id = self.pull_queue();
                self.spawn(id);
                self.refill_queue();
            }
            Some(id) => self.spawn(id),
        }
        self.can_hold = false;
        self.drop_timer = 0;
        true
    }

    /// Advances gravity by `delta_ms`, respecting the current drop interval.
    pub fn tick(&mut self, delta_ms: u32) {
        if !self.is_active() {
            return;
        }
        self.drop_timer = self.drop_timer.saturating_add(delta_ms);
        let interval = drop_interval(self.level);
        while self.drop_timer >= interval {
            if !self.is_active() {
                break;
            }
            self.drop_timer -= interval;
            self.gravity_step();
        }
    }

    /// Row the active piece would land on with a hard drop (0 when idle).
    pub fn ghost_row_of_piece(&self) -> i8 {
        match &self.piece {
            Some(piece) => ghost_row(&self.board, &piece.cells, piece.size, piece.x, piece.y),
            None => 0,
        }
    }

    /// Piece count waiting in the ready queue: exactly `QUEUE_SIZE`.
    #[cfg(test)]
    pub fn queued_pieces(&self) -> usize {
        self.queue.iter().filter(|id| **id != 0).count()
    }

    fn is_active(&self) -> bool {
        self.status == Status::Playing && self.piece.is_some()
    }

    fn gravity_step(&mut self) {
        let Some(piece) = self.piece else {
            return;
        };
        if collides(&self.board, &piece.cells, piece.size, piece.x, piece.y + 1) {
            self.land();
        } else if let Some(piece) = &mut self.piece {
            piece.y += 1;
        }
    }

    /// Locks the piece, clears lines, updates score/level/spawns the next one
    /// from the queue.
    fn land(&mut self) {
        let piece = match self.piece.take() {
            Some(piece) => piece,
            None => return,
        };
        if (0..piece.size).any(|row| {
            piece.y + (row as i8) < 0 && (0..piece.size).any(|col| piece.cells[row * 4 + col] != 0)
        }) {
            self.status = Status::Over;
            return;
        }
        lock_piece(
            &mut self.board,
            &piece.cells,
            piece.size,
            piece.x,
            piece.y,
            piece.id,
        );
        let (cleared, points) = resolve_lines(&mut self.board, self.level);
        self.lines += cleared;
        self.score += points;
        self.level = level_for_lines(self.lines);
        self.can_hold = true;
        self.drop_timer = 0;
        let next = self.pull_queue();
        self.spawn(next);
        self.refill_queue();
    }

    /// Spawns a piece centered at the top; an immediate collision ends the
    /// game while keeping the piece visible, for the end-of-run view.
    fn spawn(&mut self, id: u8) {
        let size = spawn_size(id);
        if size == 0 {
            return;
        }
        let mut cells = [0u8; 16];
        spawn_cells(id, &mut cells);
        let x = ((COLS as i32 - size as i32) / 2) as i8;
        if collides(&self.board, &cells, size, x, 0) {
            self.status = Status::Over;
        }
        self.piece = Some(Piece {
            id,
            size,
            cells,
            x,
            y: 0,
        });
    }

    /// Pops the head of the ready queue.
    fn pull_queue(&mut self) -> u8 {
        let next = self.queue[0];
        self.queue.copy_within(1.., 0);
        self.queue[QUEUE_SIZE - 1] = 0;
        next
    }

    /// Keeps `QUEUE_SIZE` piece ids available out of successive shuffled bags.
    fn refill_queue(&mut self) {
        for index in 0..QUEUE_SIZE {
            if self.queue[index] == 0 {
                self.queue[index] = self.pull_bag();
            }
        }
    }

    /// Shuffled-bag randomiser: each piece id appears once per bag.
    fn pull_bag(&mut self) -> u8 {
        if self.bag_len == 0 {
            self.bag.copy_from_slice(&PIECE_IDS);
            for index in (1..self.bag.len()).rev() {
                let pick = self.rng.range(index + 1);
                self.bag.swap(index, pick);
            }
            self.bag_len = self.bag.len();
        }
        self.bag_len -= 1;
        self.bag[self.bag_len]
    }
}

mod rand {
    /// SplitMix64: small and well-distributed enough for piece bags.
    pub struct Rng(u64);

    impl Rng {
        pub fn new(seed: u64) -> Self {
            Rng(seed.wrapping_add(0x0061_c886_4a7b_aad3))
        }

        fn next(&mut self) -> u64 {
            self.0 = self.0.wrapping_add(GOLDEN_GAMMA);
            let mut mixed = self.0;
            mixed = (mixed ^ (mixed >> 30)).wrapping_mul(0xbf58_476d_8ce4_e5b9);
            mixed = (mixed ^ (mixed >> 27)).wrapping_mul(0x94d0_49bb_1331_11eb);
            mixed ^ (mixed >> 31)
        }

        /// Uniform value in `0..order`, rejection-rolled to avoid modulo bias
        /// even though the bag sizes are small.
        pub fn range(&mut self, order: usize) -> usize {
            let mask = order.next_power_of_two() - 1;
            loop {
                let candidate = (self.next() & mask as u64) as usize;
                if candidate < order {
                    return candidate;
                }
            }
        }
    }

    const GOLDEN_GAMMA: u64 = 0x9e37_79b9_7f4a_7c15;
}

#[cfg(test)]
mod tests;
