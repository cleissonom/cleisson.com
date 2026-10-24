"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"

import type { SudokuDictionary } from "@/data/sudoku/types"
import type { Locale } from "@/lib/i18n"
import type { Difficulty } from "@/lib/sudoku/abi"
import { useGameFullscreen } from "./use-game-fullscreen"
import { useSudokuGame } from "./sudoku-state"

type Props = { wasmPath: string; locale: Locale; copy: SudokuDictionary }
const DIGITS = Array.from({ length: 9 }, (_, index) => index + 1)
const TOOLS = [
  ["notes", "✎"],
  ["undo", "↶"],
  ["clear", "⌫"],
  ["hint", "?"],
  ["pause", "Ⅱ"]
] as const

export function formatSudokuTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export function SudokuGame({ wasmPath, locale, copy }: Props) {
  const game = useSudokuGame(wasmPath)
  const container = useRef<HTMLElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const [selected, setSelected] = useState(0)
  const [notesMode, setNotesMode] = useState(false)
  const {
    fullscreen,
    button: fullscreenButton,
    toggle: toggleFullscreen
  } = useGameFullscreen(container, board)
  const id = useId()
  const playing = game.status === "playing"
  const covered = ["loading", "paused", "error"].includes(game.status)
  const current = game.session
  const difficulty = current?.difficulty ?? 0
  const best = game.records[difficulty]

  function focus(index: number) {
    setSelected(index)
    cells.current[index]?.focus({ preventScroll: true })
  }

  function enter(value: number) {
    game.entry(selected, value, notesMode && value !== 0)
    focus(selected)
  }

  function tool(action: (typeof TOOLS)[number][0]) {
    if (action === "notes") setNotesMode((value) => !value)
    else if (action === "undo") game.undo()
    else if (action === "clear") enter(0)
    else if (action === "pause") game.pause()
    else {
      const suggestion = game.explainHint()
      if (suggestion) setSelected(suggestion.index)
    }
  }

  function keydown(event: KeyboardEvent) {
    if (!playing || event.altKey) return
    const key = event.key.toLowerCase()
    if ((event.ctrlKey || event.metaKey) && key === "z") {
      event.preventDefault()
      game.undo()
      return
    }
    if (event.ctrlKey || event.metaKey) return
    const row = Math.floor(selected / 9)
    const destinations: Record<string, number> = {
      ArrowLeft: Math.max(0, selected - 1),
      ArrowRight: Math.min(80, selected + 1),
      ArrowUp: Math.max(0, selected - 9),
      ArrowDown: Math.min(80, selected + 9),
      Home: row * 9,
      End: row * 9 + 8
    }
    if (event.key in destinations) focus(destinations[event.key])
    else if (/^[1-9]$/.test(key)) enter(Number(key))
    else if (["Backspace", "Delete"].includes(event.key)) enter(0)
    else if (key === "n") setNotesMode((value) => !value)
    else return
    event.preventDefault()
  }

  function newPuzzle(next: Difficulty) {
    const wasPlaying = playing
    game.pause()
    if (
      current &&
      game.status !== "solved" &&
      !window.confirm(`${copy.replaceTitle}\n\n${copy.replaceNote}`)
    ) {
      if (wasPlaying) game.resume()
      return
    }
    setNotesMode(false)
    setSelected(0)
    game.newGame(next)
  }

  function cellLabel(index: number) {
    const value = current?.values[index] ?? 0
    const mask = current?.notes[index] ?? 0
    const notes = DIGITS.filter((digit) => mask & (1 << (digit - 1))).join(", ")
    return [
      copy.cellLabel
        .replace("{row}", String(Math.floor(index / 9) + 1))
        .replace("{column}", String((index % 9) + 1))
        .replace("{value}", value ? String(value) : copy.emptyLabel),
      current?.givens[index] ? copy.givenLabel : "",
      game.conflicts[index] ? copy.conflictLabel : "",
      notes ? `${copy.notesLabel}: ${notes}` : ""
    ]
      .filter(Boolean)
      .join(". ")
  }

  const hintMessage = game.hint
    ? copy.hintMessages[game.hint.kind]
        .replace("{row}", String(Math.floor(game.hint.index / 9) + 1))
        .replace("{column}", String((game.hint.index % 9) + 1))
        .replaceAll("{value}", String(game.hint.value))
    : copy.noHint

  return (
    <section
      ref={container}
      className={`sudoku${fullscreen ? " is-fullscreen" : ""}`}
      role={fullscreen ? "dialog" : undefined}
      aria-modal={fullscreen ? true : undefined}
      aria-label={copy.boardLabel}
      lang={locale}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) game.pause()
      }}
    >
      <div className="sudoku-play">
        <div className="sudoku-toolbar">
          <label>
            {copy.difficultyLabel}
            <select
              aria-label={copy.difficultyLabel}
              value={difficulty}
              disabled={!current || game.status === "loading"}
              onChange={(event) => newPuzzle(Number(event.target.value) as Difficulty)}
            >
              {copy.difficultyLabels.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="secondary-button"
            disabled={!current}
            onClick={() => newPuzzle(difficulty)}
          >
            {copy.actions.newGame}
          </button>
          <button
            ref={fullscreenButton}
            type="button"
            className="secondary-button"
            aria-pressed={fullscreen}
            disabled={!current || game.status === "loading"}
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? copy.actions.exitFullscreen : copy.actions.fullscreen}
          </button>
        </div>
        <dl className="sudoku-hud">
          <div>
            <dt>{copy.elapsedLabel}</dt>
            <dd>{formatSudokuTime(current?.elapsedMs ?? 0)}</dd>
          </div>
          <div>
            <dt>{copy.bestTimeLabel}</dt>
            <dd>{best ? formatSudokuTime(best) : copy.noBestTime}</dd>
          </div>
        </dl>
        <div className="sudoku-board-wrap">
          <div
            ref={board}
            className={`sudoku-grid${covered ? " is-covered" : ""}`}
            role="grid"
            aria-label={copy.boardLabel}
            aria-rowcount={9}
            aria-colcount={9}
            aria-describedby={`${id}-input`}
            tabIndex={-1}
            onKeyDown={keydown}
          >
            {DIGITS.map((row) => (
              <div role="row" key={row}>
                {DIGITS.map((column) => {
                  const index = (row - 1) * 9 + column - 1
                  const value = current?.values[index] ?? 0
                  const given = Boolean(current?.givens[index])
                  const mask = current?.notes[index] ?? 0
                  return (
                    <button
                      key={index}
                      ref={(node) => {
                        cells.current[index] = node
                      }}
                      type="button"
                      role="gridcell"
                      className={`sudoku-cell${game.conflicts[index] ? " has-conflict" : ""}`}
                      aria-rowindex={row}
                      aria-colindex={column}
                      aria-label={cellLabel(index)}
                      aria-readonly={given}
                      aria-selected={selected === index}
                      aria-invalid={game.conflicts[index] || undefined}
                      tabIndex={selected === index ? 0 : -1}
                      disabled={!playing}
                      data-given={given}
                      data-value={value}
                      data-notes={mask}
                      onClick={() => focus(index)}
                    >
                      {value || (
                        <span className="sudoku-notes" aria-hidden="true">
                          {DIGITS.map((digit) => (
                            <span key={digit}>{mask & (1 << (digit - 1)) ? digit : ""}</span>
                          ))}
                        </span>
                      )}
                      {game.conflicts[index] ? (
                        <span className="sudoku-conflict" aria-hidden="true">
                          !
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          {covered ? (
            <div className="sudoku-overlay">
              <p className="sudoku-overlay-title">{copy.statusLabels[game.status]}</p>
              {game.status === "error" ? (
                <p>{copy.loadError}</p>
              ) : game.status === "loading" ? (
                <p>{copy.loadingNote}</p>
              ) : null}
              <button
                type="button"
                className="primary-button"
                disabled={game.status === "loading"}
                onClick={() => {
                  if (game.status === "error") game.retry()
                  else {
                    game.resume()
                    requestAnimationFrame(() => focus(selected))
                  }
                }}
              >
                {game.status === "error" ? copy.actions.retry : copy.actions.resume}
              </button>
            </div>
          ) : null}
        </div>
        <div className="sudoku-input">
          <div className="sudoku-tools">
            {TOOLS.map(([action, icon]) => (
              <button
                key={action}
                type="button"
                className="secondary-button"
                aria-label={copy.actions[action]}
                title={copy.actions[action]}
                aria-pressed={action === "notes" ? notesMode : undefined}
                disabled={!playing || (action === "undo" && !game.canUndo)}
                onClick={() => tool(action)}
              >
                <span aria-hidden="true">{icon}</span>
                <span className="sudoku-tool-label">{copy.actions[action]}</span>
              </button>
            ))}
          </div>
          <div className="sudoku-numberpad" role="group" aria-label={copy.numberPadLabel}>
            {DIGITS.map((digit) => (
              <button
                key={digit}
                type="button"
                className="secondary-button"
                disabled={!playing}
                onClick={() => enter(digit)}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
        <p className="sudoku-status" role="status">
          {copy.statusLabels[game.status]}
          {current ? ` · ${current.hintsUsed ? copy.assistedLabel : copy.unassistedLabel}` : ""}
        </p>
        {game.storageUnavailable ? (
          <p className="sudoku-storage-warning" role="status">
            {copy.storageUnavailable}
          </p>
        ) : null}
        {game.status === "solved" ? (
          <p className="sudoku-completion" role="status">
            {current?.hintsUsed ? copy.solvedAssistedNote : copy.solvedNote}
          </p>
        ) : null}
        {game.hintOpen ? (
          <section className="sudoku-hint" aria-labelledby={`${id}-hint`}>
            <h3 id={`${id}-hint`}>{copy.hintTitle}</h3>
            <p>{hintMessage}</p>
            <div className="sudoku-hint-actions">
              {game.hint ? (
                <button
                  type="button"
                  className="primary-button"
                  disabled={!playing}
                  onClick={game.applyHint}
                >
                  {copy.actions.applyHint}
                </button>
              ) : null}
              <button type="button" className="secondary-button" onClick={game.closeHint}>
                {copy.actions.dismissHint}
              </button>
            </div>
          </section>
        ) : null}
      </div>
      <aside className="sudoku-information">
        {game.restored ? <p>{copy.restoredNote}</p> : null}
        <p id={`${id}-input`}>{copy.inputHint}</p>
        <h2>{copy.rulesTitle}</h2>
        <ol>
          {copy.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <p>{copy.difficultyNote}</p>
        <p>{copy.storageNote}</p>
        <p>{copy.accessibilityNote}</p>
        <dl className="sudoku-records">
          {copy.difficultyLabels.map((label, index) => (
            <div key={label}>
              <dt>
                {label} · {copy.bestTimeLabel}
              </dt>
              <dd>
                {game.records[index as Difficulty]
                  ? formatSudokuTime(game.records[index as Difficulty]!)
                  : copy.noBestTime}
              </dd>
            </div>
          ))}
        </dl>
        <noscript>
          <p>{copy.loadingNote}</p>
        </noscript>
      </aside>
    </section>
  )
}
