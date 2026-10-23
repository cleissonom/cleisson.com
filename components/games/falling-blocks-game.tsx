"use client"

import { useRef } from "react"

import type { GamePageDictionary } from "@/data/i18n/types"
import { COLS, ROWS, FALLING_BLOCKS_STATUS } from "@/lib/falling-blocks/abi"
import type { Locale } from "@/lib/i18n"
import { BOARD_CELL, PREVIEW_CELL, useFallingBlocks, type GameAction } from "./use-falling-blocks"

type Props = { wasmPath: string; locale: Locale; copy: GamePageDictionary }
const EMPTY = { score: 0, level: 1, regions: 0, status: FALLING_BLOCKS_STATUS.ready }
const STATUS_KEYS = ["ready", "playing", "paused", "over"] as const
const ACTIONS = [
  "left",
  "down",
  "right",
  "counterclockwise",
  "drop",
  "clockwise",
  "hold",
  "pause",
  "restart"
] as const

export function FallingBlocksGame({ wasmPath, locale, copy }: Props) {
  const board = useRef<HTMLCanvasElement>(null)
  const held = useRef<HTMLCanvasElement>(null)
  const next = useRef<HTMLCanvasElement>(null)
  const { snapshot, failed, perform, pause, retry } = useFallingBlocks(wasmPath, board, held, next)
  const view = snapshot ?? EMPTY
  const playing = view.status === FALLING_BLOCKS_STATUS.playing
  const loading = !snapshot && !failed
  const status = STATUS_KEYS[view.status] ?? "ready"
  const { overlay, panelLabels, statsLabels, statusLabels } = copy
  const title = failed ? overlay.errorTitle : loading ? overlay.loadingLabel : statusLabels[status]
  const hint = failed
    ? overlay.loadErrorLabel
    : loading
      ? copy.wasmNote
      : status === "ready"
        ? overlay.readyHint
        : status === "paused"
          ? overlay.pausedHint
          : overlay.overHintTemplate
              .replace("{score}", view.score.toLocaleString(locale))
              .replace("{level}", String(view.level))
  const primaryLabel = failed
    ? overlay.retryLabel
    : status === "paused"
      ? overlay.resumeLabel
      : status === "over"
        ? overlay.replayLabel
        : overlay.startLabel

  function action(value: GameAction) {
    perform(value)
    if (value !== "pause") board.current?.focus({ preventScroll: true })
  }

  return (
    <section
      className="falling-blocks"
      aria-label={overlay.canvasLabel}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) pause()
      }}
    >
      <div className="falling-blocks-play">
        <dl className="falling-blocks-hud">
          {(["score", "level", "regions"] as const).map((key) => (
            <div key={key}>
              <dt>{statsLabels[key]}</dt>
              <dd>{view[key].toLocaleString(locale)}</dd>
            </div>
          ))}
        </dl>
        <div className="falling-blocks-board-wrap">
          <canvas
            ref={board}
            className="falling-blocks-board"
            width={COLS * BOARD_CELL}
            height={ROWS * BOARD_CELL}
            tabIndex={0}
            role="img"
            aria-label={overlay.canvasLabel}
            aria-describedby="game-input-hint"
            onClick={() => board.current?.focus()}
          >
            {copy.accessibilityNote}
          </canvas>
          {!playing ? (
            <div className="falling-blocks-overlay">
              <p className="falling-blocks-overlay-title">{title}</p>
              <p className="falling-blocks-overlay-hint">{hint}</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => (failed ? retry() : action("start"))}
                disabled={loading}
              >
                {primaryLabel}
              </button>
            </div>
          ) : null}
        </div>
        <p className="sr-only" role="status">
          {title}
        </p>
        <p id="game-input-hint" className="muted falling-blocks-input-hint">
          {copy.inputHint}
        </p>
        <div className="falling-blocks-actions" aria-label={panelLabels.touch}>
          {ACTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className="secondary-button"
              disabled={!snapshot || failed || (value !== "restart" && !playing)}
              onClick={() => action(value)}
            >
              {copy.actionLabels[value]}
            </button>
          ))}
        </div>
      </div>
      <aside className="falling-blocks-panels">
        <div className="falling-blocks-slots">
          {[
            { ref: held, label: panelLabels.hold },
            { ref: next, label: panelLabels.next }
          ].map(({ ref, label }) => (
            <figure key={label} className="falling-blocks-slot">
              <figcaption>{label}</figcaption>
              <canvas
                ref={ref}
                className="falling-blocks-preview"
                width={4 * PREVIEW_CELL}
                height={4 * PREVIEW_CELL}
                aria-hidden="true"
              />
            </figure>
          ))}
        </div>
        <div className="falling-blocks-rules">
          <h2>{copy.rulesTitle}</h2>
          <ol>
            {copy.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>
        <details className="falling-blocks-controls">
          <summary>{panelLabels.controls}</summary>
          <dl>
            {copy.controls.map(({ key, action }) => (
              <div key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </details>
        <p className="muted">{copy.accessibilityNote}</p>
        <noscript>
          <p>{copy.wasmNote}</p>
        </noscript>
      </aside>
    </section>
  )
}
