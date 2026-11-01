import { test, expect } from "@playwright/test"

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce"
})

const games = [
  {
    slug: "falling-blocks",
    root: ".falling-blocks",
    board: ".falling-blocks-board",
    control: "Drop"
  },
  {
    slug: "sudoku",
    root: ".sudoku",
    board: ".sudoku-cell[data-given='false']",
    control: "Pencil notes"
  }
]

async function start(page, game) {
  await page.goto(`/en-US/games/${game.slug}`)
  if (game.slug === "falling-blocks")
    await page.getByRole("button", { name: "Start", exact: true }).tap()
  else await page.locator(game.board).first().tap()
  await expect(page.getByRole("button", { name: game.control, exact: true })).toBeEnabled()
}

for (const game of games) {
  for (const fullscreen of [false, true]) {
    test(`${game.slug} internal touch controls stay active${fullscreen ? " in fullscreen" : ""}`, async ({
      page
    }) => {
      await start(page, game)
      if (fullscreen) await page.getByRole("button", { name: "Fullscreen", exact: true }).tap()
      await page.locator(game.board).first().tap()
      const control = page.getByRole("button", { name: game.control, exact: true })
      await control.tap()
      await expect(control).toBeEnabled()
      await expect(page.getByRole("button", { name: "Resume", exact: true })).toHaveCount(0)
      if (game.slug === "falling-blocks")
        await expect(page.locator(".falling-blocks-hud dd").first()).not.toHaveText("0")
      else await expect(control).toHaveAttribute("aria-pressed", "true")
      await page.locator(game.board).first().tap()
      await page.locator(`${game.root}-hud dd`).first().tap()
      await expect(control).toBeEnabled()
      await expect(page.getByRole("button", { name: "Resume", exact: true })).toHaveCount(0)
      await page.locator(game.board).first().tap()
      if (game.slug === "sudoku") {
        await page
          .getByRole("group", { name: "Number pad", exact: true })
          .getByRole("button", { name: "3", exact: true })
          .tap()
        await expect(page.locator(game.board).first()).toHaveAttribute("data-notes", "4")
      }
      await page.getByRole("button", { name: "Pause", exact: true }).tap()
      await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
      await page.getByRole("button", { name: "Resume", exact: true }).tap()
      await expect(control).toBeEnabled()
    })
  }

  test(`${game.slug} still pauses for outside interaction and window blur`, async ({ page }) => {
    await start(page, game)
    for (const leave of [
      () => page.getByRole("heading", { level: 1 }).tap(),
      () => page.locator(".js-theme-toggle").focus(),
      () => page.evaluate(() => window.dispatchEvent(new Event("blur")))
    ]) {
      await page.locator(game.board).first().tap()
      await leave()
      await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
      await page.getByRole("button", { name: "Resume", exact: true }).tap()
      await expect(page.getByRole("button", { name: game.control, exact: true })).toBeEnabled()
    }
  })

  test(`${game.slug} a cancelled touch cannot mask later focus loss`, async ({ page }) => {
    await start(page, game)
    const board = page.locator(game.board).first()
    await board.focus()
    await board.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 1 })
    await board.dispatchEvent("pointercancel", { pointerType: "touch", pointerId: 1 })
    await board.evaluate((element) => element.blur())
    await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
  })

  test(`${game.slug} outside focus after an internal touch still pauses`, async ({ page }) => {
    await start(page, game)
    const control = page.getByRole("button", { name: game.control, exact: true })
    for (const target of [control, page.locator(`${game.root}-hud dd`).first()]) {
      await page.locator(game.board).first().tap()
      await target.tap()
      await expect(control).toBeEnabled()
      await page.locator(".js-theme-toggle").focus()
      await expect(page.getByRole("button", { name: "Resume", exact: true })).toBeVisible()
      await page.getByRole("button", { name: "Resume", exact: true }).tap()
    }
  })
}

test("4096 keeps accepting touch moves after a tap on its score", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "4096.progress",
      JSON.stringify({
        version: 1,
        snapshot: { cells: [2, 2, ...Array(14).fill(0)], score: 0, moves: 0, rng: 1 },
        continued: false
      })
    )
  )
  await page.goto("/en-US/games/4096")
  const board = page.getByRole("grid", { name: "4096 board", exact: true })
  await expect(board).toHaveAttribute("aria-disabled", "false")
  await page.getByRole("button", { name: "← Left", exact: true }).tap()
  await expect(page.locator(".merge4096-hud dd").first()).toHaveText("4")
  await page.locator(".merge4096-hud dd").first().tap()
  await page.getByRole("button", { name: "↓ Down", exact: true }).tap()
  await expect(page.locator(".merge4096-status")).toContainText("Moves: 2")
  await expect(board).toHaveAttribute("aria-disabled", "false")
})
