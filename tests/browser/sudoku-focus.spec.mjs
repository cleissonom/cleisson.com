import { test, expect } from "@playwright/test"

test("the last touch undo keeps the puzzle active for the next entry", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce"
  })
  const page = await context.newPage()
  await page.goto("/en-US/games/sudoku")
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  const cell = page.locator(".sudoku-cell[data-given='false']").first()
  const notes = page.getByRole("button", { name: "Pencil notes", exact: true })
  const digit = page
    .getByRole("group", { name: "Number pad", exact: true })
    .getByRole("button", { name: "3", exact: true })
  await cell.tap()
  await notes.tap()
  await digit.tap()
  await expect(cell).toHaveAttribute("data-notes", "4")
  await notes.tap()
  await page.getByRole("button", { name: "Undo", exact: true }).tap()
  await expect(cell).toHaveAttribute("data-notes", "0")
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled()
  const activeElement = await page.evaluate(() => document.activeElement.tagName)
  await expect(
    page.locator(".sudoku-status"),
    `Last Undo left focus on ${activeElement}`
  ).toContainText("Playing")
  await expect(cell).toBeFocused()
  await cell.tap()
  await digit.tap()
  await expect(cell).toHaveAttribute("data-value", "3")
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toHaveCount(0)
  await context.close()
})

for (const action of ["Apply hint", "Close hint"]) {
  test(`${action} restores keyboard entry to the selected cell`, async ({ page }) => {
    await page.goto("/en-US/games/sudoku")
    await page.getByRole("button", { name: "Explain a hint", exact: true }).click()
    const cell = page.locator(".sudoku-cell[aria-selected='true']")
    await page.getByRole("button", { name: action, exact: true }).click()
    await expect(page.locator(".sudoku-hint")).toHaveCount(0)
    await expect(cell).toBeFocused()
    const box = await cell.boundingBox()
    expect(box.y).toBeGreaterThanOrEqual(-1)
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height + 1)
    await page.keyboard.press(action === "Apply hint" ? "Delete" : "1")
    await expect(cell).toHaveAttribute("data-value", action === "Apply hint" ? "0" : "1")
    await expect(page.locator(".sudoku-status")).toContainText("Playing")
  })
}
