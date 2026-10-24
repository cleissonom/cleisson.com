import { test, expect } from "@playwright/test"

const path = "/en-US/games/falling-blocks"
const enter = (page) => page.getByRole("button", { name: "Fullscreen", exact: true })
const exit = (page) => page.getByRole("button", { name: "Exit fullscreen", exact: true })

async function expectOverlayFits(page) {
  const frame = await page.locator(".falling-blocks-board").boundingBox()
  for (const child of await page.locator(".falling-blocks-overlay > *").all()) {
    const box = await child.boundingBox()
    expect(box.y).toBeGreaterThanOrEqual(frame.y)
    expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height)
  }
}

test("the laptop canvas fills its frame and has readable controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(path)
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await enter(page).click()
  const dimensions = await page.locator(".falling-blocks-board").evaluate((canvas) => ({
    canvas: canvas.getBoundingClientRect().width,
    frame: canvas.parentElement.clientWidth
  }))
  expect(Math.abs(dimensions.canvas - dimensions.frame)).toBeLessThan(1)
  for (const button of await page.locator(".falling-blocks-actions button").all()) {
    expect(await button.evaluate((element) => element.offsetHeight)).toBe(44)
  }
})

for (const [locale, startLabel, fullscreenLabel, resumeLabel] of [
  ["pt-BR", "Iniciar", "Tela cheia", "Retomar"],
  ["es-ES", "Empezar", "Pantalla completa", "Continuar"]
]) {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 844, height: 390 }
  ]) {
    test(`localized fullscreen remains readable in ${locale} at ${viewport.width}×${viewport.height}`, async ({
      page
    }) => {
      await page.setViewportSize(viewport)
      await page.addInitScript(() =>
        localStorage.setItem("falling-blocks.best-score", "4294967295")
      )
      await page.goto(`/${locale}/games/falling-blocks`)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.getByRole("button", { name: startLabel, exact: true })).toBeEnabled()
      await expectOverlayFits(page)
      await page.getByRole("button", { name: startLabel, exact: true }).click()
      await page.getByRole("button", { name: fullscreenLabel, exact: true }).click()
      for (const control of await page
        .locator(".falling-blocks-toolbar button, .falling-blocks-actions button")
        .all()) {
        const box = await control.boundingBox()
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
        expect(
          await control.evaluate((element) => element.scrollWidth <= element.clientWidth)
        ).toBe(true)
      }
      for (const number of await page.locator(".falling-blocks-hud dd").all()) {
        expect(
          await number.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))
        ).toBeGreaterThanOrEqual(14)
        expect(await number.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true
        )
        expect(
          await number.evaluate(
            (element) =>
              element.scrollHeight <= parseFloat(getComputedStyle(element).lineHeight) + 1
          )
        ).toBe(true)
      }
      for (const label of await page.locator(".falling-blocks-hud dt").all()) {
        expect(await label.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true
        )
      }
      await page.getByRole("button", { name: "Pausar", exact: true }).click()
      await expectOverlayFits(page)
      await page.getByRole("button", { name: resumeLabel, exact: true }).click()
    })
  }
}

test("fullscreen keeps a run and follows the browser exit", async ({ page }) => {
  await page.goto(path)
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await page.keyboard.press("Space")
  const points = await page.locator(".falling-blocks-hud dd").first().textContent()
  await enter(page).click()
  await expect(exit(page)).toBeVisible()
  await expect(page.locator(".falling-blocks-board")).toBeFocused()
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true)
  await expect(page.locator(".falling-blocks-hud dd").first()).toHaveText(points)
  await page.keyboard.press("Space")
  await expect(page.locator(".falling-blocks-hud dd").first()).not.toHaveText(points)
  await page.evaluate(() => document.exitFullscreen())
  await expect(enter(page)).toBeVisible()
  await expect(enter(page)).toBeFocused()
})

for (const failure of ["missing", "rejected"]) {
  test(`fullscreen falls back when the browser API is ${failure}`, async ({ page }) => {
    await page.addInitScript((mode) => {
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: mode === "missing" ? undefined : () => Promise.reject(new Error("Unavailable"))
      })
      document.addEventListener("DOMContentLoaded", () => {
        document.body.style.overflow = "clip"
      })
    }, failure)
    await page.goto(path)
    await enter(page).click()
    await expect(exit(page)).toBeVisible()
    await expect(page.locator(".falling-blocks")).toHaveClass(/is-fullscreen/)
    expect(await page.evaluate(() => document.fullscreenElement)).toBeNull()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden")
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press("Tab")
      expect(await page.evaluate(() => !!document.activeElement.closest(".falling-blocks"))).toBe(
        true
      )
    }
    await page.keyboard.press("Escape")
    await expect(enter(page)).toBeVisible()
    await expect(enter(page)).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("clip")
  })
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 568, height: 320 },
  { width: 844, height: 390 }
]) {
  test(`touch play fits ${viewport.width}×${viewport.height} with and without fullscreen`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce"
    })
    const page = await context.newPage()
    await page.goto(path)
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled()
    await page.evaluate(() => document.fonts.ready)
    await expectOverlayFits(page)
    await page.getByRole("button", { name: "Start", exact: true }).tap()
    for (const fullscreen of [false, true]) {
      if (fullscreen) await enter(page).tap()
      if (!fullscreen) {
        await page.locator(".falling-blocks-toolbar").evaluate((element) => {
          element.scrollIntoView({ block: "start" })
        })
      }
      const board = await page.locator(".falling-blocks-board").boundingBox()
      const buttons = await page.locator(".falling-blocks-actions button").all()
      expect(Math.abs(board.width / board.height - 12 / 20)).toBeLessThan(0.01)
      expect(board.y).toBeGreaterThanOrEqual(0)
      expect(board.y + board.height).toBeLessThanOrEqual(viewport.height + 1)
      for (const button of buttons) {
        const box = await button.boundingBox()
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1)
      }
      await page.getByRole("button", { name: "← Left", exact: true }).tap()
      await page.getByRole("button", { name: "↻ Rotate", exact: true }).tap()
      await page.getByRole("button", { name: "Drop", exact: true }).tap()
      await expect(page.locator(".falling-blocks-hud dd").first()).not.toHaveText("0")
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      )
      await page.getByRole("button", { name: "Pause", exact: true }).tap()
      await expectOverlayFits(page)
      await page.getByRole("button", { name: "Resume", exact: true }).tap()
    }
    await exit(page).tap()
    await expect(enter(page)).toBeVisible()
    await context.close()
  })
}
