import { test, expect } from "@playwright/test"

const locales = ["en-US", "pt-BR", "es-ES"]
const paths = [
  "",
  "/projects",
  "/projects/devimg",
  "/blog",
  "/blog/implementation-planning-vs-developing",
  "/experience",
  "/resume",
  "/about",
  "/contact",
  "/privacy",
  "/mcp",
  "/blog/does-not-exist"
]

for (const width of [320, 360, 390, 768, 1440]) {
  for (const colorScheme of ["light", "dark"]) {
    test(`${width}px ${colorScheme}: every localized page family reflows`, async ({ page }) => {
      test.setTimeout(90000)
      await page.setViewportSize({ width, height: 900 })
      await page.emulateMedia({ colorScheme })
      for (const locale of locales) {
        for (const path of paths) {
          const response = await page.goto(`/${locale}${path}`)
          expect(response.status(), `${locale}${path}`).toBe(
            path.endsWith("does-not-exist") ? 404 : 200
          )
          await expect(page.locator("main")).toHaveCount(1)
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth
          )
          expect.soft(overflow, `${locale}${path} at ${width}px ${colorScheme}`).toBe(false)
        }
      }
    })
  }
}

test("all localized content remains within 320px with doubled root text", async ({ page }) => {
  test.setTimeout(90000)
  await page.setViewportSize({ width: 320, height: 740 })
  for (const locale of locales) {
    for (const path of paths) {
      await page.goto(`/${locale}${path}`)
      await page.addStyleTag({ content: "html { font-size: 200% !important }" })
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect.soft(width, `${locale}${path} with 200% root text`).toBeLessThanOrEqual(320)
    }
  }
})

test("touch filters preserve any-selected-label behavior and reset feedback", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  })
  const page = await context.newPage()
  await page.goto("/en-US/projects")
  await page.locator(".projects-label-dropdown summary").tap()
  await page.locator("label", { hasText: /^Audit Logs$/ }).tap()
  await expect(page.locator(".projects-grid article")).toHaveCount(1)
  const initial = await page.locator(".projects-grid article").allTextContents()
  await page.locator("label", { hasText: /^CLI$/ }).tap()
  await expect
    .poll(() => page.locator(".projects-grid article").count())
    .toBeGreaterThan(initial.length)
  const expanded = await page.locator(".projects-grid article").allTextContents()
  expect(expanded.length).toBeGreaterThan(initial.length)
  expect(expanded).toEqual(expect.arrayContaining(initial))
  await page.getByRole("button", { name: /clear/i }).tap()
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await context.close()
})

test("failed script loading preserves core content and unavailable-control behavior", async ({
  page
}) => {
  await page.route("**/*.js", (route) => route.abort("failed"))
  await page.goto("/es-ES/projects")
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await expect(page.locator(".projects-filter")).toBeHidden()
  // The small inline theme handler can remain useful even when application bundles fail.
  const toggle = page.locator(".js-theme-toggle")
  if (await toggle.isEnabled()) {
    const before = await page.locator("html").getAttribute("data-theme")
    await toggle.click()
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      before === "dark" ? "light" : "dark"
    )
  }
  await page.locator(".locale-dropdown summary").click()
  await page.locator(".locale-dropdown [hreflang='pt-BR']").click()
  await expect(page).toHaveURL(/\/pt-BR\/projects$/)
})

test("blocked inline and external scripts leave honest controls and native navigation", async ({
  page
}) => {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") return route.continue()
    const response = await route.fetch()
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": "script-src 'none'" }
    })
  })
  await page.goto("/pt-BR/projects")
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await expect(page.locator(".projects-filter")).toBeHidden()
  await expect(page.locator(".js-theme-toggle")).toBeDisabled()
  await page.locator(".locale-dropdown summary").click()
  await page.locator(".locale-dropdown [hreflang='en-US']").click()
  await expect(page).toHaveURL(/\/en-US\/projects$/)
})

test("delayed bundles reveal the project filter without moving its results", async ({ page }) => {
  let releaseScripts
  const pending = new Promise((resolve) => {
    releaseScripts = resolve
  })
  await page.route("**/*.js", async (route) => {
    await pending
    await route.continue()
  })
  await page.goto("/en-US/projects", { waitUntil: "commit" })
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
  await expect(page.locator(".projects-filter")).toBeHidden()
  const before = await page.locator(".projects-grid").boundingBox()
  releaseScripts()
  await expect(page.locator(".projects-filter")).toBeVisible()
  const after = await page.locator(".projects-grid").boundingBox()
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1)
})
