import { test, expect } from "@playwright/test"

const path = "/en-US/games/sudoku"
const editable = (page) => page.locator(".sudoku-cell[data-given='false']").first()
const time = (page) => page.locator(".sudoku-hud dd").first()
const solution = [
  ..."534678912672195348198342567859761423426853791713924856961537284287419635345286179"
].map(Number)

async function restoreAlmostSolved(page, { hintsUsed = 0, best = null } = {}) {
  await page.addInitScript(
    ({ solved, hints, record }) => {
      const givens = [...solved]
      givens[0] = 0
      localStorage.setItem(
        "sudoku.progress",
        JSON.stringify({
          version: 1,
          difficulty: 0,
          givens,
          values: givens,
          notes: Array(81).fill(0),
          elapsedMs: 60000,
          hintsUsed: hints
        })
      )
      if (record) localStorage.setItem("sudoku.best-times", JSON.stringify({ 0: record }))
    },
    { solved: solution, hints: hintsUsed, record: best }
  )
  await page.goto(path)
  await page.getByRole("button", { name: "Resume", exact: true }).click()
}

test("Sudoku provides an editable keyboard grid with immutable clues", async ({ page }) => {
  await page.goto(path)
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  await expect(page.locator(".sudoku-cell")).toHaveCount(81)
  await expect(page.locator(".sudoku-cell[data-given='true']")).toHaveCount(42)
  const clue = page.locator(".sudoku-cell[data-given='true']").first()
  const original = await clue.textContent()
  await clue.focus()
  await page.keyboard.press("Delete")
  await expect(clue).toHaveText(original)
  const cell = editable(page)
  await cell.click()
  await page.keyboard.press("1")
  await expect(cell).toHaveAttribute("data-value", "1")
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  await expect(cell).toHaveAttribute("data-value", "0")
})

test("notes, clear, undo, and local restoration preserve a puzzle", async ({ page }) => {
  await page.goto(path)
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  await editable(page).click()
  await page.keyboard.press("n")
  await page.keyboard.press("3")
  await page.keyboard.press("5")
  await expect(editable(page)).toHaveAttribute("data-notes", "20")
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  await expect(editable(page)).toHaveAttribute("data-notes", "4")
  await page.getByRole("button", { name: "Clear cell", exact: true }).click()
  await expect(editable(page)).toHaveAttribute("data-notes", "0")
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  await page.reload()
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Resume", exact: true }).click()
  await expect(editable(page)).toHaveAttribute("data-notes", "4")
  await expect(page.getByRole("button", { name: "Undo", exact: true })).toBeDisabled()
})

test("active time pauses on blur and reload and resumes explicitly", async ({ page }) => {
  await page.clock.install()
  await page.goto(path)
  await expect(editable(page)).toBeEnabled()
  await page.clock.fastForward(3000)
  await expect(time(page)).toHaveText("0:03")
  await page.evaluate(() => window.dispatchEvent(new Event("blur")))
  await page.clock.fastForward(10000)
  await expect(time(page)).toHaveText("0:03")
  await page.getByRole("button", { name: "Resume", exact: true }).click()
  await page.clock.fastForward(2000)
  await expect(time(page)).toHaveText("0:05")
  await page.reload()
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
  await page.clock.fastForward(5000)
  await expect(time(page)).toHaveText("0:05")
})

test("hints explain before applying and stay assisted after undo and reload", async ({ page }) => {
  await page.goto(path)
  await page.getByRole("button", { name: "Explain a hint", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Hint explanation", exact: true })).toBeVisible()
  await expect(page.locator(".sudoku-status")).toContainText("Hints used")
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem("sudoku.progress")).values
  )
  await page.getByRole("button", { name: "Apply hint", exact: true }).click()
  const after = await page.evaluate(
    () => JSON.parse(localStorage.getItem("sudoku.progress")).values
  )
  expect(after).not.toEqual(before)
  await page.getByRole("button", { name: "Undo", exact: true }).click()
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("sudoku.progress")).values)
  ).toEqual(before)
  await page.reload()
  await expect(page.locator(".sudoku-status")).toContainText("Hints used")
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("sudoku.progress")).hintsUsed)
  ).toBeGreaterThan(0)
})

test("difficulty replacement requires confirmation and cancellation preserves the run", async ({
  page
}) => {
  await page.goto(path)
  await expect(editable(page)).toBeEnabled()
  const original = await page.evaluate(
    () => JSON.parse(localStorage.getItem("sudoku.progress")).givens
  )
  page.once("dialog", (dialog) => dialog.dismiss())
  await page.getByLabel("Difficulty", { exact: true }).selectOption("2")
  await expect(page.getByLabel("Difficulty", { exact: true })).toHaveValue("0")
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem("sudoku.progress")).givens)
  ).toEqual(original)
  await expect(editable(page)).toBeEnabled()
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByLabel("Difficulty", { exact: true }).selectOption("2")
  await expect(page.getByLabel("Difficulty", { exact: true })).toHaveValue("2")
  await expect(page.locator(".sudoku-cell[data-given='true']")).toHaveCount(29)
})

test("an unassisted completion saves its best time", async ({ page }) => {
  await restoreAlmostSolved(page)
  await editable(page).click()
  await page.keyboard.press("5")
  await expect(page.locator(".sudoku-status")).toContainText("Puzzle solved")
  const best = await page.evaluate(() => JSON.parse(localStorage.getItem("sudoku.best-times"))[0])
  expect(best).toBeGreaterThanOrEqual(60000)
})

test("an assisted completion never creates a best time", async ({ page }) => {
  await restoreAlmostSolved(page, { hintsUsed: 1 })
  await editable(page).click()
  await page.keyboard.press("5")
  await expect(page.locator(".sudoku-status")).toContainText("Puzzle solved")
  expect(await page.evaluate(() => localStorage.getItem("sudoku.best-times"))).toBeNull()
})

test("a previous best stays available if storage reads later fail", async ({ page }) => {
  await restoreAlmostSolved(page, { best: 30000 })
  await page.evaluate(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError")
    }
  })
  await editable(page).click()
  await page.keyboard.press("5")
  await expect(page.locator(".sudoku-hud dd").last()).toHaveText("0:30")
})

test("fallback fullscreen preserves roving focus and shows storage failures", async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = undefined
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError")
    }
  })
  await page.goto(path)
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  await editable(page).click()
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  await expect(page.locator(".sudoku-storage-warning")).toBeVisible()
  for (let index = 0; index < 4; index++) await page.keyboard.press("Tab")
  await expect(page.locator(".sudoku-cell[aria-selected='true']")).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Pencil notes", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeFocused()
})

test("fullscreen keyboard focus scrolls hint actions into view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = undefined
  })
  await page.goto(path)
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  await page.getByRole("button", { name: "Explain a hint", exact: true }).click()
  const apply = page.getByRole("button", { name: "Apply hint", exact: true })
  for (let index = 0; index < 25; index++) {
    await page.keyboard.press("Tab")
    if (await apply.evaluate((element) => element === document.activeElement)) break
  }
  await expect(apply).toBeFocused()
  const applyBox = await apply.boundingBox()
  expect(applyBox.y).toBeGreaterThanOrEqual(0)
  expect(applyBox.y + applyBox.height).toBeLessThanOrEqual(845)
  await page.keyboard.press("Tab")
  const close = page.getByRole("button", { name: "Close hint", exact: true })
  await expect(close).toBeFocused()
  const closeBox = await close.boundingBox()
  expect(closeBox.y).toBeGreaterThanOrEqual(0)
  expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(845)
})

test("paused fullscreen keyboard navigation reaches Resume", async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = undefined
  })
  await page.goto(path)
  await expect(page.getByRole("grid", { name: "Sudoku board", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  await page.getByRole("button", { name: "Pause", exact: true }).click()
  await page.getByRole("button", { name: "Exit fullscreen", exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeFocused()
})

test("loading failure can be retried", async ({ page }) => {
  let fail = true
  await page.route("**/games/sudoku/sudoku.wasm", (route) =>
    fail ? route.fulfill({ status: 503, body: "Unavailable" }) : route.continue()
  )
  await page.goto(path)
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible()
  fail = false
  await page.getByRole("button", { name: "Try again", exact: true }).click()
  await expect(editable(page)).toBeEnabled()
})

for (const [locale, rules, fullscreen] of [
  ["en-US", "How to play Sudoku", "Fullscreen"],
  ["pt-BR", "Como jogar Sudoku", "Tela cheia"],
  ["es-ES", "Cómo jugar al Sudoku", "Pantalla completa"]
]) {
  test(`Sudoku rules remain available without JavaScript in ${locale}`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`/${locale}/games/sudoku`)
    await expect(page.getByRole("heading", { name: rules, exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: fullscreen, exact: true })).toBeDisabled()
    await expect(page.locator(".sudoku-cell")).toHaveCount(81)
    await expect(page.locator(".sudoku-information ol li")).toHaveCount(4)
    await context.close()
  })
}
