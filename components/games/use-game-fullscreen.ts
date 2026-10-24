"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

export function useGameFullscreen(
  container: RefObject<HTMLElement | null>,
  board: RefObject<HTMLCanvasElement | null>
) {
  const [fullscreen, setFullscreen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const native = useRef(false)

  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement === container.current) await document.exitFullscreen()
    } catch {
      // A browser-driven exit can race the button or Escape key.
    }
    if (document.fullscreenElement !== container.current) setFullscreen(false)
  }, [container])

  useEffect(() => {
    function changed() {
      if (document.fullscreenElement === container.current) {
        native.current = true
        setFullscreen(true)
      } else if (native.current) {
        native.current = false
        setFullscreen(false)
      }
    }
    document.addEventListener("fullscreenchange", changed)
    return () => document.removeEventListener("fullscreenchange", changed)
  }, [container])

  useEffect(() => {
    if (!fullscreen) return
    const overflow = document.body.style.overflow
    const trigger = button.current
    document.body.style.overflow = "hidden"
    board.current?.focus({ preventScroll: true })
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        void exit()
      } else if (event.key === "Tab") {
        const controls = Array.from(
          container.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]), [tabindex='0']"
          ) ?? []
        ).filter((element) => element.getClientRects().length > 0)
        const current = controls.indexOf(document.activeElement as HTMLElement)
        const index =
          current < 0
            ? event.shiftKey
              ? controls.length - 1
              : 0
            : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
        event.preventDefault()
        controls[index]?.focus({ preventScroll: true })
      }
    }
    document.addEventListener("keydown", keydown, true)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener("keydown", keydown, true)
      trigger?.focus({ preventScroll: true })
    }
  }, [fullscreen, container, board, exit])

  async function toggle() {
    if (fullscreen) {
      await exit()
      return
    }
    setFullscreen(true)
    try {
      await container.current?.requestFullscreen?.()
      board.current?.focus({ preventScroll: true })
    } catch {
      // Browsers without element fullscreen still get a viewport-filling game.
    }
  }

  return { fullscreen, button, toggle }
}
