import { test, expect } from "@playwright/test"

for (const [locale, fullscreen, continueLabel] of [
  ["en-US", "Fullscreen", "Keep playing"],
  ["pt-BR", "Tela cheia", "Continuar"],
  ["es-ES", "Pantalla completa", "Continuar"]
]) {
  test(`the win message and continuation fit phone landscape in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.addInitScript(() => {
      localStorage.setItem(
        "4096.progress",
        JSON.stringify({
          version: 1,
          snapshot: { cells: [2048, 2048, 2, ...Array(13).fill(0)], score: 0, moves: 0, rng: 1 },
          continued: false
        })
      )
    })
    await page.goto(`/${locale}/games/4096`)
    const board = page.getByRole("grid")
    await expect(board).toHaveAttribute("aria-disabled", "false")
    await page.getByRole("button", { name: fullscreen, exact: true }).click()
    await board.focus()
    await page.keyboard.press("ArrowLeft")
    const overlay = page.locator(".merge4096-overlay")
    await expect(page.getByRole("button", { name: continueLabel, exact: true })).toBeFocused()
    const bounds = await overlay.boundingBox()
    for (const element of await overlay.locator(":scope > p, :scope > button").all()) {
      const box = await element.boundingBox()
      expect(box.y).toBeGreaterThanOrEqual(bounds.y)
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height)
    }
    const button = page.getByRole("button", { name: continueLabel, exact: true })
    expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44)
    await button.click()
    await expect(board).toBeFocused()
  })
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 568, height: 320 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 }
]) {
  test(`4096 touch controls and fullscreen fit ${viewport.width}×${viewport.height}`, async ({
    browser,
    baseURL
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport,
      isMobile: viewport.width < 900,
      hasTouch: true,
      reducedMotion: "reduce"
    })
    const page = await context.newPage()
    await page.goto("/en-US/games/4096")
    await expect(page.getByRole("grid", { name: "4096 board", exact: true })).toHaveAttribute(
      "aria-disabled",
      "false"
    )
    for (const fullscreen of [false, true]) {
      if (fullscreen) await page.getByRole("button", { name: "Fullscreen", exact: true }).tap()
      else
        await page
          .locator(".merge4096-toolbar")
          .evaluate((element) => element.scrollIntoView({ block: "start" }))
      const grid = await page.getByRole("grid", { name: "4096 board", exact: true }).boundingBox()
      expect(Math.abs(grid.width - grid.height)).toBeLessThan(1)
      expect(grid.y).toBeGreaterThanOrEqual(-1)
      expect(grid.y + grid.height).toBeLessThanOrEqual(viewport.height + 1)
      for (const control of await page
        .locator(".merge4096-directions button, .merge4096-toolbar button")
        .all()) {
        const box = await control.boundingBox()
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.y).toBeGreaterThanOrEqual(-1)
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1)
      }
      await page.getByRole("button", { name: "← Left", exact: true }).tap()
      await page.getByRole("button", { name: "↓ Down", exact: true }).tap()
      await expect(page.getByRole("grid", { name: "4096 board", exact: true })).toBeFocused()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      )
    }
    await page.getByRole("button", { name: "Exit fullscreen", exact: true }).tap()
    await context.close()
  })
}

test("fallback fullscreen exits with Escape and contains keyboard navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = undefined
  })
  await page.goto("/en-US/games/4096")
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  await expect(page.locator(".merge4096")).toHaveClass(/is-fullscreen/)
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press("Tab")
    expect(await page.evaluate(() => !!document.activeElement.closest(".merge4096"))).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeFocused()
})

test("large records and every tile remain readable on a small phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.addInitScript(() => {
    localStorage.setItem(
      "4096.progress",
      JSON.stringify({
        version: 1,
        snapshot: {
          cells: [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 2147483648, 0, 0],
          score: Number.MAX_SAFE_INTEGER,
          moves: 0,
          rng: 1
        },
        continued: true
      })
    )
    localStorage.setItem("4096.best-score", String(Number.MAX_SAFE_INTEGER))
  })
  await page.goto("/en-US/games/4096")
  await expect(page.getByRole("grid", { name: "4096 board", exact: true })).toHaveAttribute(
    "aria-disabled",
    "false"
  )
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click()
  for (const number of await page.locator(".merge4096-hud dd").all()) {
    expect(await number.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true
    )
  }
  const tiles = await page
    .locator(".merge4096-cell:not([data-value='0'])")
    .evaluateAll((elements) =>
      elements.map((element) => ({
        foreground: getComputedStyle(element).color,
        background: getComputedStyle(element).backgroundColor,
        textWidth: element.firstElementChild.getBoundingClientRect().width,
        availableWidth: element.clientWidth - 8
      }))
    )
  function luminance(color) {
    const channels = color
      .match(/\d+/g)
      .slice(0, 3)
      .map((value) => Number(value) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
  }
  for (const tile of tiles) {
    const foreground = luminance(tile.foreground)
    const background = luminance(tile.background)
    expect(
      (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
    ).toBeGreaterThanOrEqual(4.5)
    expect(tile.textWidth).toBeLessThanOrEqual(tile.availableWidth + 1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
