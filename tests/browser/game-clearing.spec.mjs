import { test, expect } from "@playwright/test"

test("a completed row clears while partial rows keep their cells and order", async ({ page }) => {
  await page.addInitScript(() => {
    const randomValues = crypto.getRandomValues.bind(crypto)
    crypto.getRandomValues = (array) => {
      if (array instanceof Uint32Array && array.length === 2) {
        array.set([0, 104])
        return array
      }
      return randomValues(array)
    }
  })
  const time = new Date("2026-01-01T00:00:00Z")
  await page.clock.install({ time })
  await page.clock.pauseAt(time)
  await page.goto("/en-US/games/falling-blocks")
  await page.getByRole("button", { name: "Start", exact: true }).click()
  const cleared = page.locator(".falling-blocks-hud dd").nth(2)

  // Six mixed shapes leave two holes, then one, in the bottom row.
  for (const shift of [-4, -2, 1, 2, 4, 0]) {
    for (let step = 0; step < Math.abs(shift); step += 1) {
      await page.keyboard.press(shift < 0 ? "ArrowLeft" : "ArrowRight")
    }
    await page.keyboard.press("Space")
    await expect(cleared).toHaveText("0")
  }

  // Reserve the square and use a vertical domino to fill the last hole.
  await page.keyboard.press("KeyC")
  await page.keyboard.press("ArrowUp")
  for (let step = 0; step < 5; step += 1) await page.keyboard.press("ArrowRight")
  await page.keyboard.press("Space")
  await expect(cleared).toHaveText("1")

  // Pause hides the active piece and shadow, leaving the settled board to inspect.
  await page.keyboard.press("KeyP")
  const settled = await page.locator(".falling-blocks-board").evaluate((canvas) => {
    const ctx = canvas.getContext("2d")
    const cell = canvas.width / 12
    const empty = ctx.getImageData(0.3 * cell, 0.3 * cell, 1, 1).data
    return Array.from({ length: 12 }, (_, row) =>
      Array.from({ length: 12 }, (_, col) => {
        const pixel = ctx.getImageData((col + 0.3) * cell, (row + 0.3) * cell, 1, 1).data
        return pixel.some((value, index) => value !== empty[index])
      })
    )
  })
  expect(settled.flat().filter(Boolean)).toHaveLength(8)
  expect(settled[10]).toEqual(Array.from({ length: 12 }, (_, col) => col === 5))
  expect(settled[11]).toEqual(
    Array.from({ length: 12 }, (_, col) => [3, 4, 5, 6, 7, 8, 11].includes(col))
  )
})
