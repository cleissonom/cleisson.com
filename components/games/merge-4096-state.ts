"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  load4096Engine,
  type Direction,
  type MergeBoard,
  type MergeEngine
} from "@/lib/merge-4096/abi"
import {
  load4096Progress,
  read4096Best,
  save4096Best,
  save4096Progress
} from "@/lib/merge-4096/storage"

export function use4096Game(wasmPath: string) {
  const engine = useRef<MergeEngine | null>(null)
  const highest = useRef(0)
  const continuing = useRef(false)
  const [board, setBoard] = useState<MergeBoard | null>(null)
  const [best, setBest] = useState(0)
  const [continued, setContinued] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [failed, setFailed] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const publish = useCallback((celebrateWin = false) => {
    if (!engine.current) return
    const value = engine.current.read()
    if (value.score > highest.current) {
      highest.current = Math.max(highest.current, value.score, save4096Best(value.score))
      if (read4096Best() < highest.current) setStorageUnavailable(true)
    }
    const { cells, score, moves, rng } = value
    if (
      !save4096Progress({
        version: 1,
        snapshot: { cells, score, moves, rng },
        continued: continuing.current
      })
    )
      setStorageUnavailable(true)
    setBoard(value)
    setBest(highest.current)
    setContinued(continuing.current)
    setCelebrating(celebrateWin && value.won)
  }, [])

  const newGame = useCallback(() => {
    if (!engine.current) return false
    if (!engine.current.newGame(crypto.getRandomValues(new Uint32Array(1))[0])) {
      setFailed(true)
      return false
    }
    continuing.current = false
    publish()
    return true
  }, [publish])

  useEffect(() => {
    let disposed = false
    const controller = new AbortController()
    async function load() {
      try {
        const instance = await load4096Engine(wasmPath, controller.signal)
        if (disposed) return
        engine.current = instance
        highest.current = Math.max(highest.current, read4096Best())
        const saved = load4096Progress()
        if (saved && instance.restore(saved.snapshot)) {
          continuing.current = saved.continued
          publish()
        } else newGame()
      } catch {
        if (!disposed) setFailed(true)
      }
    }
    void load()
    return () => {
      disposed = true
      controller.abort()
      engine.current = null
    }
  }, [wasmPath, attempt, newGame, publish])

  function move(direction: Direction) {
    if (!engine.current || failed) return
    const value = engine.current.read()
    if (value.over || (value.won && !continuing.current)) return
    // Only a fresh winning move celebrates; restoring a saved win stays still.
    if (engine.current.move(direction)) publish(!value.won)
  }

  function keepPlaying() {
    continuing.current = true
    publish()
  }

  function retry() {
    setFailed(false)
    setCelebrating(false)
    setBoard(null)
    setAttempt((value) => value + 1)
  }

  return {
    board,
    best,
    continued,
    celebrating,
    failed,
    storageUnavailable,
    move,
    newGame,
    keepPlaying,
    retry
  }
}
