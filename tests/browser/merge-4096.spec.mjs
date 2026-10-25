import { test, expect } from "@playwright/test"

const path = "/en-US/games/4096"
const board = (page) => page.getByRole("grid", { name: "4096 board", exact: true })
const progress = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("4096.progress")))
const cells = (page) =>
  page
    .getByRole("gridcell")
    .evaluateAll((elements) => elements.map((element) => Number(element.dataset.value)))

async function seed(page, values, { score = 0, best = 0, continued = false } = {}) {
  await page.addInitScript(
    ({ values, score, best, continued }) => {
      if (!localStorage.getItem("4096.progress"))
        localStorage.setItem(
          "4096.progress",
          JSON.stringify({
            version: 1,
            snapshot: { cells: values, score, moves: 0, rng: 1 },
            continued
          })
        )
      if (!localStorage.getItem("4096.best-score"))
        localStorage.setItem("4096.best-score", String(best))
    },
    { values, score, best, continued }
  )
  await page.goto(path)
  await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeEnabled()
}

test("4096 exposes its board and moves tiles with the keyboard", async ({ page }) => {
  await page.goto("/en-US/games/4096")
  const board = page.getByRole("grid", { name: "4096 board", exact: true })
  await expect(board).toBeVisible()
  await expect(page.getByRole("gridcell")).toHaveCount(16)
  await board.focus()
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowDown")
  await expect(page.locator(".merge4096-status")).toContainText("Playing")
})

test("each tile merges once and a changed move adds one tile", async ({ page }) => {
  await seed(page, [2, 2, 4, 4, ...Array(12).fill(0)])
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  const value = (await progress(page)).snapshot
  expect(value.cells.slice(0, 2)).toEqual([4, 8])
  expect(value.cells.filter(Boolean)).toHaveLength(3)
  expect(value.cells.reduce((sum, value) => sum + value, 0)).toBeGreaterThan(12)
  expect(value.score).toBe(12)
  expect(value.moves).toBe(1)
  await expect(page.locator(".merge4096-hud dd").last()).toHaveText("12")
})

test("a no-op leaves cells, score, move count, and random state unchanged", async ({ page }) => {
  await seed(page, [2, 4, 8, 16, ...Array(12).fill(0)])
  const before = await progress(page)
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  expect(await progress(page)).toEqual(before)
})

test("WASD works only on the board and direction buttons use the same moves", async ({ page }) => {
  await seed(page, [0, 2, 0, 2, ...Array(12).fill(0)])
  const before = await progress(page)
  await page.getByRole("button", { name: "New game", exact: true }).focus()
  await page.keyboard.press("a")
  expect(await progress(page)).toEqual(before)
  await board(page).focus()
  await page.keyboard.press("a")
  expect((await progress(page)).snapshot.score).toBe(4)
  await page.getByRole("button", { name: "↓ Down", exact: true }).click()
  expect((await progress(page)).snapshot.moves).toBe(2)
  await expect(board(page)).toBeFocused()
})

test("swipes move once and ignore small, cancelled, and multiple-touch gestures", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  })
  const page = await context.newPage()
  await seed(page, [2, 0, 0, 0, 4, ...Array(11).fill(0)])
  await board(page).scrollIntoViewIfNeeded()
  const box = await board(page).boundingBox()
  const client = await context.newCDPSession(page)
  const point = { x: box.x + 32, y: box.y + 32 }
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  for (const distance of [32, 64, 100])
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: point.x + distance, y: point.y }]
    })
  expect((await progress(page)).snapshot.moves).toBe(0)
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.locator(".merge4096-status")).toContainText("Moves: 1")
  const before = await progress(page)
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x + 8, y: point.y }]
  })
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  expect(await progress(page)).toEqual(before)
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: point.x + 100, y: point.y }]
  })
  await client.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] })
  expect(await progress(page)).toEqual(before)
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point, { x: point.x + 50, y: point.y + 50 }]
  })
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  expect(await progress(page)).toEqual(before)
  await context.close()
})

test("4096 celebrates the goal and persists the choice to keep playing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await seed(page, [2048, 2048, 2, ...Array(13).fill(0)])
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  await expect(page.getByRole("button", { name: "Keep playing", exact: true })).toBeFocused()
  expect((await cells(page)).includes(4096)).toBe(true)
  await expect(page.locator(".merge4096-overlay-title")).toContainText("Congratulations!")
  const animationStarts = await page.locator(".merge4096-overlay").evaluate((element) =>
    element.getAnimations({ subtree: true }).map((animation) => {
      const timing = animation.effect.getComputedTiming()
      return { start: animation.startTime, iterations: timing.iterations, duration: timing.endTime }
    })
  )
  expect(animationStarts.length).toBeGreaterThan(1)
  for (const animation of animationStarts) {
    expect(animation.iterations).toBe(1)
    expect(animation.duration).toBeLessThanOrEqual(3500)
  }
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  const fullscreenStarts = await page
    .locator(".merge4096-overlay")
    .evaluate((element) =>
      element.getAnimations({ subtree: true }).map((animation) => animation.startTime)
    )
  expect(fullscreenStarts).toEqual(animationStarts.map((animation) => animation.start))
  await page.locator(".merge4096-overlay").evaluate(async (element) => {
    await Promise.all(
      element.getAnimations({ subtree: true }).map((animation) => animation.finished)
    )
  })
  await page.getByRole("button", { name: "Keep playing", exact: true }).click()
  await expect(board(page)).toBeFocused()
  expect((await progress(page)).continued).toBe(true)
  await page.reload()
  await expect(board(page)).toHaveAttribute("aria-disabled", "false")
  await expect(page.getByRole("button", { name: "Keep playing", exact: true })).toHaveCount(0)
  await expect(page.locator(".merge4096-hud dd").last()).toHaveText("4,096")
})

test("a restored win keeps its message without replaying the celebration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await seed(page, [4096, 2, ...Array(14).fill(0)])
  await expect(page.locator(".merge4096-overlay-title")).toContainText("Congratulations!")
  expect(
    await page
      .locator(".merge4096-overlay")
      .evaluate((element) => element.getAnimations({ subtree: true }).length)
  ).toBe(0)
  await page.getByRole("button", { name: "Keep playing", exact: true }).click()
  await expect(board(page)).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(page.locator(".merge4096-overlay")).toHaveCount(0)
})

test("reduced motion keeps congratulations and continuation without animation", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await seed(page, [2048, 2048, 2, ...Array(13).fill(0)])
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".merge4096-overlay-title")).toContainText("Congratulations!")
  expect(
    await page
      .locator(".merge4096-board-wrap")
      .evaluate((element) => element.getAnimations({ subtree: true }).length)
  ).toBe(0)
  await expect(page.getByRole("button", { name: "Keep playing", exact: true })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(board(page)).toBeFocused()
  await expect(board(page)).toHaveAttribute("aria-disabled", "false")
})

test("terminal boards offer a new game and retain the record", async ({ page }) => {
  await seed(page, [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2], { score: 128, best: 256 })
  await expect(page.locator(".merge4096-overlay-title")).toHaveText("No moves left")
  await page
    .locator(".merge4096-overlay")
    .getByRole("button", { name: "New game", exact: true })
    .click()
  await expect(board(page)).toBeFocused()
  expect((await cells(page)).filter(Boolean)).toHaveLength(2)
  await expect(page.locator(".merge4096-hud dd").first()).toHaveText("0")
  await expect(page.locator(".merge4096-hud dd").last()).toHaveText("256")
})

test("new games require confirmation, preserve the best, and restore after reload", async ({
  page
}) => {
  await seed(page, [2, 2, ...Array(14).fill(0)])
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  const before = await progress(page)
  page.once("dialog", (dialog) => dialog.dismiss())
  await page.getByRole("button", { name: "New game", exact: true }).click()
  expect(await progress(page)).toEqual(before)
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "New game", exact: true }).click()
  await expect(board(page)).toBeFocused()
  await expect(page.locator(".merge4096-hud dd").first()).toHaveText("0")
  await expect(page.locator(".merge4096-hud dd").last()).toHaveText("4")
  const fresh = await progress(page)
  await page.reload()
  await expect(board(page)).toHaveAttribute("aria-disabled", "false")
  expect(await progress(page)).toEqual(fresh)
})

test("storage failures preserve the visit's record and remain visible in fullscreen", async ({
  page
}) => {
  await seed(page, [2, 2, ...Array(14).fill(0)], { best: 100000 })
  await page.evaluate(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError")
    }
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError")
    }
  })
  await board(page).focus()
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".merge4096-hud dd").last()).toHaveText("100,000")
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  await expect(page.locator(".merge4096-storage-warning")).toBeVisible()
  await page.keyboard.press("Escape")
})

test("loading failure can be retried and returns keyboard focus to the board", async ({ page }) => {
  let fail = true
  await page.route("**/games/4096/4096.wasm", (route) =>
    fail ? route.fulfill({ status: 503, body: "Unavailable" }) : route.continue()
  )
  await page.goto(path)
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeEnabled()
  fail = false
  await page.getByRole("button", { name: "Try again", exact: true }).click()
  await expect(board(page)).toBeFocused()
  await expect(board(page)).toHaveAttribute("aria-disabled", "false")
})

for (const [locale, rules, fullscreen] of [
  ["en-US", "How to play 4096", "Fullscreen"],
  ["pt-BR", "Como jogar 4096", "Tela cheia"],
  ["es-ES", "Cómo jugar a 4096", "Pantalla completa"]
]) {
  test(`4096 rules remain available without JavaScript in ${locale}`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`/${locale}/games/4096`)
    await expect(page.getByRole("heading", { name: rules, exact: true })).toBeVisible()
    await expect(page.getByRole("gridcell")).toHaveCount(16)
    await expect(page.getByRole("button", { name: fullscreen, exact: true })).toBeDisabled()
    await context.close()
  })
}
