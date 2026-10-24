import { test, expect } from "@playwright/test"

const gamePath = "/en-US/games/falling-blocks"
const board = (page) => page.locator(".falling-blocks-board")
const score = (page) => page.locator(".falling-blocks-hud dd").first()

async function start(page) {
  await page.goto(gamePath)
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator(".falling-blocks-overlay")).toHaveCount(0)
}

test("game shortcuts leave keyboard navigation outside the board alone", async ({ page }) => {
  await start(page)
  const theme = page.locator(".js-theme-toggle")
  await theme.focus()
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
  const before = await page.locator("html").getAttribute("data-theme")
  await page.keyboard.press("Enter")
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", before)
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
})

test("keyboard play, pause, resume, and restart preserve their state contracts", async ({
  page
}) => {
  await start(page)
  await expect(board(page)).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await page.keyboard.press("ArrowUp")
  await page.keyboard.press("Space")
  await expect(score(page)).not.toHaveText("0")
  const points = await score(page).textContent()
  await page.keyboard.press("KeyP")
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
  await page.keyboard.press("Space")
  await page.keyboard.press("ArrowDown")
  await expect(score(page)).toHaveText(points)
  await page.keyboard.press("Enter")
  await expect(page.locator(".falling-blocks-overlay")).toHaveCount(0)
  await page.keyboard.press("KeyR")
  await expect(score(page)).toHaveText("0")
  await page.evaluate(() => window.dispatchEvent(new Event("blur")))
  await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
})

test("mobile buttons support a run without a keyboard and fit a narrow screen", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true
  })
  const page = await context.newPage()
  await page.goto(gamePath)
  await page.getByRole("button", { name: "Start", exact: true }).tap()
  await page.getByRole("button", { name: "← Left", exact: true }).tap()
  await page.getByRole("button", { name: "↻ Rotate", exact: true }).tap()
  await page.getByRole("button", { name: "Reserve", exact: true }).tap()
  await page.getByRole("button", { name: "Drop", exact: true }).tap()
  await expect(score(page)).not.toHaveText("0")
  await page.getByRole("button", { name: "Pause", exact: true }).tap()
  await expect(page.getByRole("button", { name: "Drop", exact: true })).toBeDisabled()
  await page.getByRole("button", { name: "Resume", exact: true }).tap()
  await expect(page.getByRole("button", { name: "Drop", exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const box = await board(page).boundingBox()
  expect(Math.abs(box.width / box.height - 12 / 20)).toBeLessThan(0.01)
  await context.close()
})

test("module failure shows one retryable error and recovers", async ({ page }) => {
  let requests = 0
  let failRequests = true
  await page.route("**/games/falling-blocks/falling-blocks.wasm", async (route) => {
    requests += 1
    if (failRequests) await route.fulfill({ status: 503, body: "Unavailable" })
    else await route.continue()
  })
  await page.goto(gamePath)
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible()
  const failedRequests = requests
  expect(failedRequests).toBeGreaterThanOrEqual(1)
  expect(failedRequests).toBeLessThanOrEqual(2) // Development Strict Mode can abort the first mount.
  failRequests = false
  await page.getByRole("button", { name: "Try again", exact: true }).click()
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator(".falling-blocks-overlay")).toHaveCount(0)
  expect(requests).toBe(failedRequests + 1)
})

test("loading disables actions until the engine is available", async ({ page }) => {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  await page.route("**/games/falling-blocks/falling-blocks.wasm", async (route) => {
    await gate
    await route.continue()
  })
  await page.goto(gamePath)
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeDisabled()
  await expect(page.getByText("Loading game…").first()).toBeVisible()
  release()
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled()
})

for (const [locale, rules, startLabel, shortcuts, bestLabel] of [
  ["en-US", "How to play", "Start", "Keyboard shortcuts", "Best score"],
  ["pt-BR", "Como jogar", "Iniciar", "Atalhos do teclado", "Recorde"],
  ["es-ES", "Cómo jugar", "Empezar", "Atajos de teclado", "Récord"]
]) {
  test(`rules and controls remain available without JavaScript in ${locale}`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto(`/${locale}/games/falling-blocks`)
    await expect(page.getByRole("heading", { name: "Falling Blocks", exact: true })).toBeVisible()
    await expect(page.getByRole("heading", { name: rules, exact: true })).toBeVisible()
    await expect(page.locator(".falling-blocks-rules li")).toHaveCount(4)
    await expect(
      page.locator(".falling-blocks-hud dt").filter({ hasText: bestLabel })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: startLabel, exact: true })).toBeDisabled()
    await page.getByText(shortcuts, { exact: true }).click()
    await expect(page.locator("kbd").first()).toBeVisible()
    await context.close()
  })
}
