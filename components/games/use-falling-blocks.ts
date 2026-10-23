"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

import {
  COLS,
  ROWS,
  FALLING_BLOCKS_STATUS,
  loadFallingBlocksEngine,
  type FallingBlocksEngine
} from "@/lib/falling-blocks/abi"
import { drawBoard, drawPiecePreview, fitCanvas } from "@/lib/falling-blocks/render"

export const BOARD_CELL = 32
export const PREVIEW_CELL = 18
export type GameAction =
  | "start"
  | "pause"
  | "restart"
  | "left"
  | "right"
  | "down"
  | "clockwise"
  | "counterclockwise"
  | "drop"
  | "hold"
export type Snapshot = { score: number; level: number; lines: number; status: number }

function initialize(engine: FallingBlocksEngine) {
  const seed = crypto.getRandomValues(new Uint32Array(2))
  engine.init(seed[0], seed[1])
}

function act(engine: FallingBlocksEngine, action: GameAction) {
  switch (action) {
    case "start":
      if (engine.read().status === FALLING_BLOCKS_STATUS.paused) engine.pause()
      else engine.start()
      break
    case "restart":
      initialize(engine)
      engine.start()
      break
    case "pause":
      engine.pause()
      break
    case "left":
      engine.move(-1)
      break
    case "right":
      engine.move(1)
      break
    case "down":
      engine.softDrop()
      break
    case "clockwise":
      engine.rotate(1)
      break
    case "counterclockwise":
      engine.rotate(-1)
      break
    case "drop":
      engine.hardDrop()
      break
    case "hold":
      engine.hold()
      break
  }
}

const KEYS: Record<string, GameAction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowUp: "clockwise",
  KeyX: "clockwise",
  KeyZ: "counterclockwise",
  Space: "drop",
  KeyC: "hold",
  KeyP: "pause",
  Escape: "pause",
  KeyR: "restart",
  Enter: "start"
}

type CanvasRef = RefObject<HTMLCanvasElement | null>

export function useFallingBlocks(
  wasmPath: string,
  board: CanvasRef,
  held: CanvasRef,
  next: CanvasRef
) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const dispatch = useRef<((action: GameAction) => void) | null>(null)
  const pauseRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let disposed = false
    let frameHandle = 0
    let cleanup = () => {}
    const controller = new AbortController()

    async function load() {
      try {
        const engine = await loadFallingBlocksEngine(wasmPath, controller.signal)
        if (disposed || !board.current || !held.current || !next.current) return
        initialize(engine)
        const canvas = board.current
        const ctx = fitCanvas(canvas, COLS * BOARD_CELL, ROWS * BOARD_CELL)
        const previews = [held.current, next.current].map((el) =>
          fitCanvas(el, 4 * PREVIEW_CELL, 4 * PREVIEW_CELL)
        )
        let lastTime = performance.now()
        let previous: Snapshot | null = null

        function render() {
          const frame = engine.read()
          drawBoard(ctx, frame, BOARD_CELL)
          for (const [index, id] of [frame.held, frame.queue[0]].entries()) {
            engine.previewSize(id)
            drawPiecePreview(previews[index], id, engine.read().preview, PREVIEW_CELL, 4, 4)
          }
          const value = {
            score: frame.score,
            level: frame.level,
            lines: frame.lines,
            status: frame.status
          }
          if (
            !previous ||
            Object.keys(value).some(
              (key) => value[key as keyof Snapshot] !== previous?.[key as keyof Snapshot]
            )
          ) {
            previous = value
            setSnapshot(value)
          }
        }

        function schedule() {
          if (!frameHandle && engine.read().status === FALLING_BLOCKS_STATUS.playing) {
            lastTime = performance.now()
            frameHandle = requestAnimationFrame(onFrame)
          }
        }

        function onFrame(now: number) {
          frameHandle = 0
          engine.tick(Math.min(now - lastTime, 100))
          lastTime = now
          render()
          if (engine.read().status === FALLING_BLOCKS_STATUS.playing)
            frameHandle = requestAnimationFrame(onFrame)
        }

        function perform(action: GameAction) {
          act(engine, action)
          render()
          schedule()
        }

        function pause() {
          if (engine.read().status === FALLING_BLOCKS_STATUS.playing) perform("pause")
        }

        function onKey(event: KeyboardEvent) {
          if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
          const action = KEYS[event.code]
          if (!action) return
          event.preventDefault()
          if (event.repeat && !["left", "right", "down"].includes(action)) return
          if (action === "start" && engine.read().status === FALLING_BLOCKS_STATUS.playing) return
          perform(action)
        }

        function visibilityChanged() {
          if (document.hidden) pause()
        }
        dispatch.current = perform
        pauseRef.current = pause
        canvas.addEventListener("keydown", onKey)
        window.addEventListener("blur", pause)
        document.addEventListener("visibilitychange", visibilityChanged)
        cleanup = () => {
          canvas.removeEventListener("keydown", onKey)
          window.removeEventListener("blur", pause)
          document.removeEventListener("visibilitychange", visibilityChanged)
        }
        render()
      } catch {
        if (!disposed) setFailed(true)
      }
    }

    void load()
    return () => {
      disposed = true
      controller.abort()
      cancelAnimationFrame(frameHandle)
      cleanup()
      dispatch.current = null
      pauseRef.current = null
    }
  }, [wasmPath, attempt, board, held, next])

  const perform = useCallback((action: GameAction) => dispatch.current?.(action), [])
  const pause = useCallback(() => pauseRef.current?.(), [])
  const retry = () => {
    setFailed(false)
    setSnapshot(null)
    setAttempt((value) => value + 1)
  }
  return { snapshot, failed, perform, pause, retry }
}
