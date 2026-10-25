"use client"

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent
} from "react"

import type { Merge4096Dictionary } from "@/data/merge-4096/types"
import type { Locale } from "@/lib/i18n"
import type { Direction } from "@/lib/merge-4096/abi"
import { useGameFullscreen } from "./use-game-fullscreen"
import { use4096Game } from "./merge-4096-state"

type Props = { wasmPath: string; locale: Locale; copy: Merge4096Dictionary }
const KEYS: Record<string, Direction> = {
  ArrowLeft: 0,
  a: 0,
  ArrowUp: 1,
  w: 1,
  ArrowRight: 2,
  d: 2,
  ArrowDown: 3,
  s: 3
}
const ROWS = [0, 1, 2, 3]

export function Merge4096Game({ wasmPath, locale, copy }: Props) {
  const game = use4096Game(wasmPath)
  const container = useRef<HTMLElement>(null)
  const board = useRef<HTMLDivElement>(null)
  const overlayButton = useRef<HTMLButtonElement>(null)
  const gesture = useRef<{ pointer: number; x: number; y: number } | null>(null)
  const afterRetry = useRef(false)
  const {
    fullscreen,
    button: fullscreenButton,
    toggle: toggleFullscreen
  } = useGameFullscreen(container, board)
  const id = useId()
  const status = game.failed
    ? "error"
    : !game.board
      ? "loading"
      : game.board.won && !game.continued
        ? "won"
        : game.board.over
          ? "over"
          : "playing"
  const playing = status === "playing"
  const values = game.board?.cells ?? Array(16).fill(0)

  useEffect(() => {
    if (afterRetry.current && game.board && !game.failed) {
      afterRetry.current = false
      if (status === "playing") board.current?.focus()
      else overlayButton.current?.focus()
    } else if (
      (status === "won" || status === "over") &&
      document.activeElement === board.current
    ) {
      overlayButton.current?.focus()
    }
  }, [game.board, game.failed, status])

  function focusBoard() {
    requestAnimationFrame(() => board.current?.focus())
  }

  function newGame() {
    if (
      game.board &&
      !game.board.over &&
      !window.confirm(`${copy.replaceTitle}\n\n${copy.replaceNote}`)
    )
      return
    if (game.newGame()) focusBoard()
  }

  function keydown(event: KeyboardEvent) {
    if (!playing || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const direction = KEYS[event.key] ?? KEYS[event.key.toLowerCase()]
    if (direction === undefined) return
    event.preventDefault()
    game.move(direction)
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!playing || !event.isPrimary || event.button !== 0 || gesture.current) {
      gesture.current = null
      return
    }
    gesture.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus({ preventScroll: true })
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    gesture.current = null
    if (!start || start.pointer !== event.pointerId || !playing) return
    const x = event.clientX - start.x
    const y = event.clientY - start.y
    if (Math.max(Math.abs(x), Math.abs(y)) < 24) return
    game.move(Math.abs(x) > Math.abs(y) ? (x < 0 ? 0 : 2) : y < 0 ? 1 : 3)
  }

  function primary() {
    if (status === "error") {
      afterRetry.current = true
      game.retry()
    } else if (status === "won") {
      game.keepPlaying()
      focusBoard()
    } else if (status === "over") newGame()
  }

  const hint =
    status === "error"
      ? copy.loadError
      : status === "loading"
        ? copy.loadingNote
        : status === "won"
          ? copy.wonNote
          : copy.overNote
  const primaryLabel =
    status === "won"
      ? copy.actions.continue
      : status === "over"
        ? copy.actions.newGame
        : copy.actions.retry

  return (
    <section
      ref={container}
      className={`merge4096${fullscreen ? " is-fullscreen" : ""}`}
      lang={locale}
      aria-label={copy.boardLabel}
      role={fullscreen ? "dialog" : undefined}
      aria-modal={fullscreen ? true : undefined}
    >
      <div className="merge4096-play">
        <div className="merge4096-toolbar">
          <button
            type="button"
            className="secondary-button"
            disabled={!game.board || game.failed}
            onClick={newGame}
          >
            {copy.actions.newGame}
          </button>
          <button
            ref={fullscreenButton}
            type="button"
            className="secondary-button"
            disabled={!fullscreen && (!game.board || game.failed)}
            aria-pressed={fullscreen}
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? copy.actions.exitFullscreen : copy.actions.fullscreen}
          </button>
        </div>
        <dl className="merge4096-hud">
          {[
            { label: copy.scoreLabel, value: game.board?.score ?? 0 },
            { label: copy.bestScoreLabel, value: game.best }
          ].map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd aria-label={value.toLocaleString(locale)}>
                <span aria-hidden="true">
                  {value
                    .toLocaleString(locale)
                    .split(/(?=[,.])/)
                    .map((part, index) => (
                      <span key={index} className="merge4096-number-part">
                        {part}
                      </span>
                    ))}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <div className="merge4096-board-wrap">
          <div
            ref={board}
            role="grid"
            className="merge4096-grid"
            aria-label={copy.boardLabel}
            aria-rowcount={4}
            aria-colcount={4}
            aria-describedby={`${id}-input`}
            aria-disabled={!playing}
            tabIndex={playing ? 0 : -1}
            onKeyDown={keydown}
            onPointerDown={pointerDown}
            onPointerUp={pointerUp}
            onPointerCancel={() => {
              gesture.current = null
            }}
            onLostPointerCapture={() => {
              gesture.current = null
            }}
          >
            {ROWS.map((row) => (
              <div key={row} role="row">
                {ROWS.map((column) => {
                  const value = values[row * 4 + column]
                  const label = copy.cellLabel
                    .replace("{row}", String(row + 1))
                    .replace("{column}", String(column + 1))
                    .replace("{value}", value ? value.toLocaleString(locale) : copy.emptyLabel)
                  return (
                    <div
                      key={column}
                      role="gridcell"
                      className="merge4096-cell"
                      data-value={value}
                      style={{ "--tile-digits": String(value).length } as CSSProperties}
                      aria-rowindex={row + 1}
                      aria-colindex={column + 1}
                      aria-label={label}
                    >
                      <span>{value || ""}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          {!playing ? (
            <div className="merge4096-overlay">
              <p className="merge4096-overlay-title">{copy.statusLabels[status]}</p>
              <p>{hint}</p>
              <button
                ref={overlayButton}
                type="button"
                className="primary-button"
                disabled={status === "loading"}
                onClick={primary}
              >
                {primaryLabel}
              </button>
            </div>
          ) : null}
        </div>
        <div className="merge4096-directions" role="group" aria-label={copy.controlsLabel}>
          {copy.directionLabels.map((label, direction) => (
            <button
              key={label}
              type="button"
              className="secondary-button"
              disabled={!playing}
              onClick={() => {
                game.move(direction as Direction)
                board.current?.focus({ preventScroll: true })
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="merge4096-status" role="status">
          {copy.statusLabels[status]} · {copy.scoreLabel}:{" "}
          {(game.board?.score ?? 0).toLocaleString(locale)} · {copy.movesLabel}:{" "}
          {(game.board?.moves ?? 0).toLocaleString(locale)}
        </p>
        {game.storageUnavailable ? (
          <p className="merge4096-storage-warning" role="status">
            {copy.storageUnavailable}
          </p>
        ) : null}
      </div>
      <aside className="merge4096-information">
        <p id={`${id}-input`}>{copy.inputHint}</p>
        <h2>{copy.rulesTitle}</h2>
        <ol>
          {copy.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
        <p>{copy.storageNote}</p>
        <p>{copy.accessibilityNote}</p>
        <noscript>
          <p>{copy.loadingNote}</p>
        </noscript>
      </aside>
    </section>
  )
}
