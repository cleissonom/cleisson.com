import { test, expect } from "@playwright/test"

test("the orbital illustration moves visibly and settles within five seconds", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en-US")
  const illustration = page.locator(".astronomy-portrait > svg")
  await expect(illustration).toBeVisible()
  expect((await illustration.boundingBox()).width).toBeGreaterThanOrEqual(240)
  await expect(illustration).toHaveAttribute("aria-hidden", "true")
  await expect(illustration).toHaveAttribute("focusable", "false")
  const motion = await illustration.evaluate((node) => {
    const animations = node.getAnimations({ subtree: true })
    return animations.map((animation) => {
      const timing = animation.effect.getTiming()
      animation.pause()
      animation.currentTime = 0
      const target = animation.effect.target
      const before = getComputedStyle(target).transform
      animation.currentTime = Number(timing.duration) / 2 + timing.delay
      const after = getComputedStyle(target).transform
      return { duration: Number(timing.duration) * timing.iterations + timing.delay, before, after }
    })
  })
  expect(motion.length).toBeGreaterThan(0)
  expect(motion.every(({ duration }) => duration <= 5000)).toBe(true)
  expect(motion.some(({ before, after }) => before !== after)).toBe(true)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await expect(page.locator(".hero-actions a").first()).toBeVisible()
})

test("reduced motion keeps astronomy static and content usable without JavaScript", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 }
  })
  const page = await context.newPage()
  await page.goto("/pt-BR")
  const illustration = page.locator(".astronomy-portrait > svg")
  await expect(illustration).toBeVisible()
  expect(await illustration.evaluate((node) => node.getAnimations({ subtree: true }).length)).toBe(
    0
  )
  const action = page.locator(".hero-actions a").first()
  await expect(action).toBeInViewport()
  await expect(action).toHaveAttribute("href", /^mailto:/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await expect(page.locator(".celestial-divider")).toHaveAttribute("aria-hidden", "true")
  await context.close()
})

test("project image feedback leaves keyboard link targets stationary", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/en-US/projects")
  const card = page.locator(".projects-grid article").first()
  const image = card.locator("img")
  const link = card.getByRole("link").first()
  const before = await link.boundingBox()
  await link.focus()
  await expect
    .poll(() => image.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe("none")
  const after = await link.boundingBox()
  expect(after.x).toBe(before.x)
  expect(after.y).toBe(before.y)
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(await image.evaluate((node) => getComputedStyle(node).transform)).toBe("none")
})
