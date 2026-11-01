"use client"

import { useEffect, useRef, type FocusEvent, type RefObject } from "react"

function focusLeftGame(
  root: HTMLElement | null,
  next: EventTarget | null,
  internalPointer: boolean
) {
  if (!root || (next instanceof Node && root.contains(next))) return false
  // Safari can focus the page's <main> (or nothing) while tapping a game button.
  const pageFallback = !next || (next instanceof Node && next.contains(root))
  return !internalPointer || !pageFallback
}

export function useGameFocusPause(container: RefObject<HTMLElement | null>, pause: () => void) {
  const internalPointer = useRef(false)

  useEffect(() => {
    function pointer(event: PointerEvent) {
      internalPointer.current =
        event.target instanceof Node && Boolean(container.current?.contains(event.target))
      if (!internalPointer.current) pause()
    }
    function clearPointer() {
      internalPointer.current = false
    }
    function focused(event: Event) {
      if (focusLeftGame(container.current, event.target, internalPointer.current)) pause()
    }
    document.addEventListener("pointerdown", pointer, true)
    document.addEventListener("pointerup", pointer, true)
    document.addEventListener("pointercancel", clearPointer, true)
    document.addEventListener("keydown", clearPointer, true)
    document.addEventListener("focusin", focused, true)
    // Keep the pointer context through native focus changes and React click handlers.
    document.addEventListener("click", clearPointer)
    return () => {
      document.removeEventListener("pointerdown", pointer, true)
      document.removeEventListener("pointerup", pointer, true)
      document.removeEventListener("pointercancel", clearPointer, true)
      document.removeEventListener("keydown", clearPointer, true)
      document.removeEventListener("focusin", focused, true)
      document.removeEventListener("click", clearPointer)
    }
  }, [container, pause])

  return function onBlur(event: FocusEvent<HTMLElement>) {
    if (focusLeftGame(container.current, event.relatedTarget, internalPointer.current)) pause()
  }
}
