"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  loadSudokuEngine,
  type Difficulty,
  type SudokuEngine,
  type SudokuHint
} from "@/lib/sudoku/abi"
import {
  loadSudokuProgress,
  readSudokuRecords,
  saveSudokuProgress,
  saveSudokuRecord,
  type SudokuProgress,
  type SudokuRecords
} from "@/lib/sudoku/storage"

type Status = "loading" | "playing" | "paused" | "solved" | "error"
type Move = { values: number[]; notes: number[] }

export function useSudokuGame(wasmPath: string) {
  const engine = useRef<SudokuEngine | null>(null)
  const progress = useRef<SudokuProgress | null>(null)
  const started = useRef<number | null>(null)
  const history = useRef<Move[]>([])
  const [session, setSession] = useState<SudokuProgress | null>(null)
  const [conflicts, setConflicts] = useState<boolean[]>([])
  const [status, setStatus] = useState<Status>("loading")
  const [records, setRecords] = useState<SudokuRecords>({})
  const [canUndo, setCanUndo] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [restored, setRestored] = useState(false)
  const [hint, setHint] = useState<SudokuHint | null>(null)
  const [hintOpen, setHintOpen] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const elapsed = useCallback(() => {
    const current = progress.current
    return Math.floor(
      (current?.elapsedMs ?? 0) +
        (started.current === null ? 0 : performance.now() - started.current)
    )
  }, [])

  const publish = useCallback(
    (save = true) => {
      if (!progress.current || !engine.current) return
      const board = engine.current.read()
      progress.current = { ...progress.current, givens: board.givens, values: board.values }
      const snapshot = { ...progress.current, elapsedMs: elapsed() }
      setSession(snapshot)
      setConflicts(board.conflicts)
      setCanUndo(history.current.length > 0)
      if (save && !saveSudokuProgress(snapshot)) setStorageUnavailable(true)
    },
    [elapsed]
  )

  const stopClock = useCallback(() => {
    if (progress.current) progress.current.elapsedMs = elapsed()
    started.current = null
  }, [elapsed])

  const pause = useCallback(() => {
    if (started.current === null) return
    stopClock()
    setStatus("paused")
    publish()
  }, [publish, stopClock])

  const finish = useCallback(() => {
    stopClock()
    setStatus("solved")
    const current = progress.current
    if (current && !current.hintsUsed) {
      const previous = records[current.difficulty]
      if (!previous || current.elapsedMs < previous) {
        const best = saveSudokuRecord(current.difficulty, current.elapsedMs)
        setRecords((values) => ({
          ...values,
          [current.difficulty]: Math.min(values[current.difficulty] ?? Infinity, best)
        }))
        const stored = readSudokuRecords()[current.difficulty]
        if (!stored || stored > best) setStorageUnavailable(true)
      }
    }
    publish()
  }, [publish, stopClock, records])

  const newGame = useCallback(
    (difficulty: Difficulty) => {
      if (!engine.current) return
      stopClock()
      const seed = crypto.getRandomValues(new Uint32Array(1))[0]
      if (!engine.current.generate(seed, difficulty)) {
        setStatus("error")
        return
      }
      const { givens, values } = engine.current.read()
      progress.current = {
        version: 1,
        difficulty,
        givens,
        values,
        notes: Array(81).fill(0),
        elapsedMs: 0,
        hintsUsed: 0
      }
      history.current = []
      started.current = document.hidden ? null : performance.now()
      setHint(null)
      setHintOpen(false)
      setRestored(false)
      setStatus(document.hidden ? "paused" : "playing")
      publish()
    },
    [publish, stopClock]
  )

  useEffect(() => {
    let disposed = false
    const controller = new AbortController()
    async function load() {
      try {
        const instance = await loadSudokuEngine(wasmPath, controller.signal)
        if (disposed) return
        engine.current = instance
        setRecords(readSudokuRecords())
        const saved = loadSudokuProgress()
        if (saved && instance.restore(saved.givens, saved.values)) {
          progress.current = saved
          history.current = []
          started.current = null
          setRestored(true)
          setStatus(instance.complete() ? "solved" : "paused")
          publish(false)
        } else newGame(0)
      } catch {
        if (!disposed) setStatus("error")
      }
    }
    void load()
    return () => {
      disposed = true
      controller.abort()
      stopClock()
      if (progress.current) saveSudokuProgress(progress.current)
      engine.current = null
    }
  }, [wasmPath, attempt, newGame, publish, stopClock])

  useEffect(() => {
    let ticks = 0
    const timer = setInterval(() => {
      if (started.current !== null) publish(++ticks % 5 === 0)
    }, 1000)
    const visibility = () => {
      if (document.hidden) pause()
    }
    window.addEventListener("blur", pause)
    window.addEventListener("pagehide", pause)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      clearInterval(timer)
      window.removeEventListener("blur", pause)
      window.removeEventListener("pagehide", pause)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [pause, publish])

  function remember() {
    const current = progress.current
    if (current) history.current.push({ values: [...current.values], notes: [...current.notes] })
  }

  function entry(index: number, value: number, notes = false) {
    const current = progress.current
    if (!engine.current || !current || status !== "playing" || current.givens[index]) return
    if (notes && current.values[index]) return
    if (notes && value && !current.values[index]) {
      remember()
      current.notes = [...current.notes]
      current.notes[index] ^= 1 << (value - 1)
    } else {
      if (current.values[index] === value && !current.notes[index]) return
      const previous = { values: [...current.values], notes: [...current.notes] }
      if (!engine.current.set(index, value)) return
      history.current.push(previous)
      current.notes = [...current.notes]
      current.notes[index] = 0
    }
    setHintOpen(false)
    if (engine.current.complete()) finish()
    else publish()
  }

  function undo() {
    const current = progress.current
    if (!engine.current || !current || status !== "playing") return
    const move = history.current.pop()
    if (!move || !engine.current.restore(current.givens, move.values)) return
    current.notes = move.notes
    setHintOpen(false)
    publish()
  }

  function explainHint() {
    if (!engine.current || !progress.current || status !== "playing") return
    const suggestion = engine.current.hint()
    setHint(suggestion)
    setHintOpen(true)
    if (suggestion) {
      progress.current.hintsUsed += 1
      publish()
    }
    return suggestion
  }

  function resume() {
    if (
      !engine.current ||
      !progress.current ||
      started.current !== null ||
      engine.current.complete()
    )
      return
    started.current = performance.now()
    setRestored(false)
    setStatus("playing")
  }

  function retry() {
    setStatus("loading")
    setAttempt((value) => value + 1)
  }

  return {
    session,
    conflicts,
    status,
    records,
    canUndo,
    storageUnavailable,
    restored,
    hint,
    hintOpen,
    newGame,
    entry,
    undo,
    pause,
    resume,
    retry,
    explainHint,
    closeHint: () => setHintOpen(false),
    applyHint: () => {
      if (hint) entry(hint.index, hint.value)
    }
  }
}
