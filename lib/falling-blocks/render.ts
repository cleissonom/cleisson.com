/** Canvas board rendering. Assets are drawn locally; no image or audio files. */
import {
  COLS,
  ROWS,
  type FallingBlocksGameState,
  type FallingBlocksRegions
} from "@/lib/falling-blocks/abi"

// The six shapes retain their color after landing and in the preview slots.
const PIECE_COLORS = ["#94a3b8", "#f472b6", "#fbbf24", "#a78bfa", "#38bdf8", "#a3e635", "#fb7185"]

function pieceColor(id: number): string {
  return PIECE_COLORS[id] ?? PIECE_COLORS[0]
}

/** Scale the drawing buffer for pixel density; CSS owns the display dimensions. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D {
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context is unavailable")
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  return ctx
}

function paintBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1
) {
  const inset = 2
  const edge = Math.max(2, size * 0.12)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2)
  ctx.fillStyle = "rgba(255,255,255,0.42)"
  ctx.fillRect(x + inset, y + inset, size - inset * 2, edge)
  ctx.fillRect(x + inset, y + inset, edge, size - inset * 2)
  ctx.fillStyle = "rgba(0,0,0,0.24)"
  ctx.fillRect(x + inset, y + size - inset - edge, size - inset * 2, edge)
  ctx.fillRect(x + size - inset - edge, y + inset, edge, size - inset * 2)
  if (alpha < 1) {
    ctx.globalAlpha = 0.8
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.strokeRect(
      x + inset + 0.75,
      y + inset + 0.75,
      size - inset * 2 - 1.5,
      size - inset * 2 - 1.5
    )
  }
  ctx.restore()
}

function paintMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: Uint8Array,
  matrixSize: number,
  offsetX: number,
  offsetY: number,
  cell: number,
  color: string,
  alpha = 1
) {
  for (let row = 0; row < matrixSize; row += 1) {
    for (let col = 0; col < matrixSize; col += 1) {
      if (matrix[row * 4 + col]) {
        paintBlock(ctx, offsetX + col * cell, offsetY + row * cell, cell, color, alpha)
      }
    }
  }
}

export type FallingBlocksFrame = FallingBlocksGameState & FallingBlocksRegions

export function drawBoard(ctx: CanvasRenderingContext2D, frame: FallingBlocksFrame, cell: number) {
  const width = COLS * cell
  const height = ROWS * cell
  ctx.fillStyle = "#142522"
  ctx.fillRect(0, 0, width, height)
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      ctx.fillStyle = "#1b302b"
      ctx.fillRect(col * cell + 1, row * cell + 1, cell - 2, cell - 2)
      ctx.fillStyle = "#49645a"
      ctx.beginPath()
      ctx.arc((col + 0.5) * cell, (row + 0.5) * cell, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  for (let index = 0; index < frame.board.length; index += 1) {
    const id = frame.board[index]
    if (!id) continue
    paintBlock(ctx, (index % COLS) * cell, Math.floor(index / COLS) * cell, cell, pieceColor(id))
  }

  if (frame.status !== 1 || !frame.pieceId) return

  const color = pieceColor(frame.pieceId)
  const size = frame.pieceSize
  if (frame.ghostRow > frame.pieceY) {
    paintMatrix(
      ctx,
      frame.pieceCells,
      size,
      frame.pieceX * cell,
      frame.ghostRow * cell,
      cell,
      color,
      0.28
    )
  }
  paintMatrix(ctx, frame.pieceCells, size, frame.pieceX * cell, frame.pieceY * cell, cell, color)
}

/** Centers a spawn matrix inside a small preview canvas sized in cells. */
export function drawPiecePreview(
  ctx: CanvasRenderingContext2D,
  pieceId: number,
  cells: Uint8Array,
  cell: number,
  sceneCols: number,
  sceneRows: number
) {
  ctx.clearRect(0, 0, sceneCols * cell, sceneRows * cell)
  if (!pieceId) return

  let top = 3
  let left = 3
  let bottom = 0
  let right = 0
  let filled = 0
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      if (!cells[row * 4 + col]) continue
      filled += 1
      if (row < top) top = row
      if (col < left) left = col
      if (row > bottom) bottom = row
      if (col > right) right = col
    }
  }
  if (!filled) return

  const boundsHeight = bottom - top + 1
  const boundsWidth = right - left + 1
  const offsetX = ((sceneCols - boundsWidth) / 2 - left) * cell
  const offsetY = ((sceneRows - boundsHeight) / 2 - top) * cell
  paintMatrix(ctx, cells, 4, offsetX, offsetY, cell, pieceColor(pieceId))
}
