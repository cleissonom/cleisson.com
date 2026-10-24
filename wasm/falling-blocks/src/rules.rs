//! Falling-block rules: mixed-size pieces and complete horizontal row clears.

pub const COLS: usize = 12;
pub const ROWS: usize = 20;
pub const BOARD_SIZE: usize = COLS * ROWS;

/// Pieces held before the next spawn.
pub const QUEUE_SIZE: usize = 3;

/// Piece ids are 1-based so that 0 can mean "no piece" in the board and ABI.
pub const PIECE_IDS: [u8; 6] = [1, 2, 3, 4, 5, 6];
const GRAVITY_BASE_MS: u32 = 900;
const GRAVITY_STEP_MS: u32 = 70;
const GRAVITY_MIN_MS: u32 = 100;

/// Wall-kick offsets tried in order when a rotation is blocked.
pub const KICKS: [(i8, i8); 6] = [(0, 0), (-1, 0), (1, 0), (-2, 0), (2, 0), (0, -1)];

/// Seed, domino, bar, corner, square, cross; matrices use a stride of four.
pub fn spawn_size(piece: u8) -> usize {
    match piece {
        1 => 1,
        2 | 4 | 5 => 2,
        3 | 6 => 3,
        _ => 0,
    }
}

pub fn spawn_cells(piece: u8, out: &mut [u8; 16]) {
    *out = match piece {
        1 => [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        2 => [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        3 => [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        4 => [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        5 => [1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        6 => [0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        _ => [0; 16],
    };
}

/// First collision test, shared by movement, gravity and rotation kicks.
/// Cells above the top border may enter play; landing there ends the run.
pub fn collides(board: &[u8; BOARD_SIZE], cells: &[u8; 16], size: usize, x: i8, y: i8) -> bool {
    for row in 0..size {
        for col in 0..size {
            if cells[row * 4 + col] == 0 {
                continue;
            }
            let board_x = x as i32 + col as i32;
            let board_y = y as i32 + row as i32;
            if board_x < 0 || board_x >= COLS as i32 || board_y >= ROWS as i32 {
                return true;
            }
            if board_y >= 0 && board[board_y as usize * COLS + board_x as usize] != 0 {
                return true;
            }
        }
    }
    false
}

/// Clockwise (> 0) or counter-clockwise rotation of a `size × size` matrix.
pub fn rotate_cells(cells: &[u8; 16], size: usize, direction: i8) -> [u8; 16] {
    let mut rotated = [0u8; 16];
    for row in 0..size {
        for col in 0..size {
            let value = if direction > 0 {
                cells[(size - 1 - col) * 4 + row]
            } else {
                cells[col * 4 + (size - 1 - row)]
            };
            rotated[row * 4 + col] = value;
        }
    }
    rotated
}

/// Row the active piece would land on with a hard drop.
pub fn ghost_row(board: &[u8; BOARD_SIZE], cells: &[u8; 16], size: usize, x: i8, y: i8) -> i8 {
    let mut row = y;
    while !collides(board, cells, size, x, row + 1) {
        row += 1;
    }
    row
}

/// Writes the piece cells into `board` where they land on the board, minus
/// overflowing rows above the top border.
pub fn lock_piece(
    board: &mut [u8; BOARD_SIZE],
    cells: &[u8; 16],
    size: usize,
    x: i8,
    y: i8,
    piece: u8,
) {
    for row in 0..size {
        for col in 0..size {
            if cells[row * 4 + col] == 0 {
                continue;
            }
            let board_x = x as i32 + col as i32;
            let board_y = y as i32 + row as i32;
            if board_y < 0 || board_y >= ROWS as i32 {
                continue;
            }
            if board_x >= 0 && board_x < COLS as i32 {
                board[board_y as usize * COLS + board_x as usize] = piece;
            }
        }
    }
}

/// Remove complete rows and move the remaining rows down intact, preserving holes.
/// Score each cleared row at the level before this placement.
pub fn resolve_lines(board: &mut [u8; BOARD_SIZE], level: u32) -> (u32, u32) {
    let mut write = ROWS;
    for read in (0..ROWS).rev() {
        let row = read * COLS..(read + 1) * COLS;
        if board[row.clone()].iter().all(|cell| *cell != 0) {
            continue;
        }
        write -= 1;
        board.copy_within(row, write * COLS);
    }
    board[..write * COLS].fill(0);
    let cleared = write as u32;
    (cleared, 90 * cleared * level)
}

pub fn level_for_lines(total: u32) -> u32 {
    total / 6 + 1
}

/// Gravity gets faster per level until it reaches `GRAVITY_MIN_MS`.
pub fn drop_interval(level: u32) -> u32 {
    let level_steps = level.saturating_sub(1).min(u32::MAX / GRAVITY_STEP_MS);
    (GRAVITY_BASE_MS.saturating_sub(level_steps.saturating_mul(GRAVITY_STEP_MS)))
        .max(GRAVITY_MIN_MS)
}

#[cfg(test)]
mod tests;
