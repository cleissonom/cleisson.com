import { test, expect } from "@playwright/test"

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 568, height: 320 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 }
]) {
  test(`Sudoku supports touch and fullscreen at ${viewport.width}×${viewport.height}`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport,
      hasTouch: true,
      reducedMotion: "reduce",
      isMobile: viewport.width < 900
    })
    const page = await context.newPage()
    await page.goto("/en-US/games/sudoku")
    await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
    const cell = page.locator(".sudoku-cell[data-given='false']").first()
    await cell.tap()
    const rows = await page
      .locator(".sudoku-grid [role='row']")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))
    expect(Math.max(...rows) - Math.min(...rows)).toBeLessThan(1)
    for (const fullscreen of [false, true]) {
      if (fullscreen) await page.getByRole("button", { name: "Fullscreen", exact: true }).tap()
      else
        await page
          .locator(".sudoku-toolbar")
          .evaluate((element) => element.scrollIntoView({ block: "start" }))
      const grid = await page.locator(".sudoku-grid").boundingBox()
      expect(Math.abs(grid.width - grid.height)).toBeLessThan(1)
      expect(grid.y).toBeGreaterThanOrEqual(0)
      expect(grid.y + grid.height).toBeLessThanOrEqual(viewport.height + 1)
      for (const button of await page.locator(".sudoku-input button").all()) {
        const box = await button.boundingBox()
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1)
      }
      await page.getByRole("button", { name: "Pencil notes", exact: true }).tap()
      await page
        .getByRole("group", { name: "Number pad", exact: true })
        .getByRole("button", { name: "3", exact: true })
        .tap()
      await expect(cell).toHaveAttribute("data-notes", fullscreen ? "0" : "4")
      await page.getByRole("button", { name: "Pencil notes", exact: true }).tap()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      )
    }
    await page.getByRole("button", { name: "Exit fullscreen", exact: true }).tap()
    await context.close()
  })
}
