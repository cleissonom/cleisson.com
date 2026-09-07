import { test, expect } from "@playwright/test"

const article = "/en-US/blog/implementation-planning-vs-developing"
const locales = ["en-US", "pt-BR", "es-ES"]

test("primary actions retain normal-text contrast in both themes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en-US")
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme)
    const ratio = await page
      .locator(".primary-button")
      .first()
      .evaluate((button) => {
        const style = getComputedStyle(button)
        const context = document.createElement("canvas").getContext("2d")
        function luminance(color) {
          context.fillStyle = color
          context.fillRect(0, 0, 1, 1)
          const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
          const values = channels.map((channel) => {
            const value = channel / 255
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
          })
          return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
        }
        const values = [luminance(style.color), luminance(style.backgroundColor)].sort(
          (a, b) => a - b
        )
        return (values[1] + 0.05) / (values[0] + 0.05)
      })
    expect(ratio, `${theme} action contrast`).toBeGreaterThanOrEqual(4.5)
  }
})

test("first keyboard link skips navigation and header stays in normal flow", async ({ page }) => {
  await page.goto("/en-US")
  await page.keyboard.press("Tab")
  await expect(page.locator(":focus")).toHaveAttribute("href", "#main-content")
  await expect(page.locator(":focus")).toBeInViewport()
  await page.keyboard.press("Enter")
  await expect(page.locator("main")).toBeFocused()
  const position = await page
    .locator(".site-header")
    .evaluate((node) => getComputedStyle(node).position)
  expect(["static", "relative"]).toContain(position)
})

test("theme control works after hydration", async ({ page }) => {
  await page.goto("/en-US")
  const toggle = page.locator(".js-theme-toggle")
  await expect(toggle).toBeEnabled()
  const before = await page.locator("html").getAttribute("data-theme")
  await toggle.click()
  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    before === "dark" ? "light" : "dark"
  )
})

test("server HTML retains article locale context and current navigation without JavaScript", async ({
  browser
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${test.info().project.use.baseURL}${article}`)
  await expect
    .soft(page.locator(".site-nav [aria-current='page']"))
    .toHaveAttribute("href", "/en-US/blog")
  await page.locator(".locale-dropdown summary").click()
  await page.locator(".locale-dropdown [hreflang='pt-BR']").click()
  await expect(page).toHaveURL(/\/pt-BR\/blog\/implementation-planning-vs-developing$/)
  await expect(page.locator("main h1")).toBeVisible()
  await context.close()
})

test("unavailable enhancements never present working controls without JavaScript", async ({
  browser
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`${test.info().project.use.baseURL}/en-US/projects`)
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await expect.soft(page.locator(".projects-filter")).toBeHidden()
  const toggle = page.locator(".js-theme-toggle")
  expect((await toggle.isHidden()) || (await toggle.isDisabled())).toBe(true)
  await context.close()
})

test("project filters work by keyboard and announce the result count", async ({ page }) => {
  await page.goto("/en-US/projects")
  await page.locator(".projects-label-dropdown summary").click()
  const auditLogs = page.getByRole("checkbox", { name: "Audit Logs", exact: true })
  await auditLogs.focus()
  await page.keyboard.press("Space")
  await expect(auditLogs).toBeChecked()
  await expect(page.locator(".projects-grid article")).toHaveCount(1)
  await expect(page.locator(".projects-filter [role='status']")).toContainText(/1/)
  await expect(auditLogs).toBeFocused()
  await page.getByRole("button", { name: /clear/i }).click()
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await expect(page.locator(".projects-filter [role='status']")).toContainText(/5/)
})

test("long locale content reflows at 320px and enlarged text", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  for (const [route, enlarged] of [
    ["/es-ES/mcp", false],
    ["/pt-BR/contact", true]
  ]) {
    await page.goto(route)
    if (enlarged) await page.addStyleTag({ content: "html { font-size: 200% !important }" })
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect.soft(width, `${route}, enlarged text: ${enlarged}`).toBeLessThanOrEqual(320)
  }
})

for (const locale of locales) {
  test(`${locale} mobile identity and resume actions precede secondary content`, async ({
    page
  }) => {
    await page.goto(`/${locale}`)
    const action = await page.locator(".hero-actions a").first().boundingBox()
    const portrait = await page.locator(".hero-portrait").boundingBox()
    expect.soft(action.y + action.height).toBeLessThan(844)
    expect.soft(action.y).toBeLessThan(portrait.y)
    await page.goto(`/${locale}/resume`)
    const pdf = await page.locator("main a[href$='.pdf']").first().boundingBox()
    expect(pdf.y + pdf.height).toBeLessThan(844)
    const panel = page.locator(".resume-contact-panel")
    if (await panel.count()) expect(pdf.y).toBeLessThan((await panel.boundingBox()).y)
  })
}

test("listing titles follow their page heading without skipped levels", async ({ page }) => {
  for (const route of ["/en-US/projects", "/en-US/blog"]) {
    await page.goto(route)
    await expect(page.locator("main > section h1, main h1")).toHaveCount(1)
    const levels = await page
      .locator("main article")
      .evaluateAll((cards) => cards.map((card) => card.querySelector("h2,h3,h4")?.tagName))
    expect(levels.length).toBeGreaterThan(0)
    expect(levels.every((level) => level === "H2")).toBe(true)
  }
})

test("reduced motion leaves card content stable and usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en-US/projects")
  const card = page.locator(".projects-grid article").first()
  await card.hover()
  expect(await card.evaluate((node) => getComputedStyle(node).transform)).toBe("none")
  await expect(card.getByRole("link").first()).toBeVisible()
})

test("project cards use three readable columns on laptops and adapt to smaller screens", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/en-US/projects")
  for (const [width, columns] of [
    [360, 1],
    [768, 2],
    [1024, 3],
    [1280, 3],
    [1440, 3]
  ]) {
    await page.setViewportSize({ width, height: 900 })
    const cards = await page
      .locator(".projects-grid article")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()))
    const firstRow = cards.filter((card) => Math.abs(card.y - cards[0].y) < 1)
    expect.soft(firstRow, `project columns at ${width}px`).toHaveLength(columns)
    expect
      .soft(Math.min(...cards.map((card) => card.width)), `card width at ${width}px`)
      .toBeGreaterThanOrEqual(300)
    expect
      .soft(await page.evaluate(() => document.documentElement.scrollWidth), `reflow at ${width}px`)
      .toBeLessThanOrEqual(width)
  }
})

test("Portuguese recovery retains locale and a single main landmark", async ({ page }) => {
  const response = await page.goto("/pt-BR/blog/does-not-exist")
  expect(response.status()).toBe(404)
  await expect.soft(page.locator("html")).toHaveAttribute("lang", "pt-BR")
  await expect.soft(page.locator("main")).toHaveCount(1)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Página não encontrada")
  await expect(page.locator("main a[href='/pt-BR']").first()).toBeVisible()
})

test("unknown paths derive recovery language from their URL", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-recovery-locale": "en-US" })
  const response = await page.goto("/pt-BR/__agent-recovery-404__")
  expect(response.status()).toBe(404)
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR")
  await expect(page.locator("main")).toHaveCount(1)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Página não encontrada")
})

test("article headings and paragraphs share one desktop reading column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(article)
  const paragraph = await page.locator(".article-prose > p").first().boundingBox()
  const heading = await page.locator(".article-prose > h2").first().boundingBox()
  expect(Math.abs(heading.x - paragraph.x)).toBeLessThanOrEqual(1)
  expect(Math.abs(heading.width - paragraph.width)).toBeLessThanOrEqual(1)
})
