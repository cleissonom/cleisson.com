import { test, expect } from "@playwright/test"

test("outside clicks dismiss labels without clearing selections or stealing focus", async ({
  page
}) => {
  await page.goto("/en-US/projects")
  const dropdown = page.locator(".projects-label-dropdown")
  const trigger = dropdown.locator("summary")
  const auditLogs = page.getByRole("checkbox", { name: "Audit Logs", exact: true })
  await trigger.click()
  await auditLogs.check()
  await expect(dropdown).toHaveAttribute("open", "")
  await expect(page.locator(".projects-grid article")).toHaveCount(1)
  const theme = page.locator(".js-theme-toggle")
  await theme.click()
  await expect(dropdown).not.toHaveAttribute("open")
  await expect(theme).toBeFocused()
  await trigger.click()
  await expect(auditLogs).toBeChecked()
  await expect(page.locator(".projects-filter [role='status']")).toHaveText("1 of 5 projects")
  await page.getByRole("button", { name: /clear/i }).click()
  await expect(dropdown).toHaveAttribute("open", "")
  await expect(page.locator(".projects-grid article")).toHaveCount(5)
})

test("tapping outside dismisses labels and preserves the selected filter", async ({
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
  await page.goto("/pt-BR/projects")
  const dropdown = page.locator(".projects-label-dropdown")
  await dropdown.locator("summary").tap()
  await page.locator("label", { hasText: /^Audit Logs$/ }).tap()
  await expect(dropdown).toHaveAttribute("open", "")
  await page.getByRole("heading", { level: 1 }).tap()
  await expect(dropdown).not.toHaveAttribute("open")
  await dropdown.locator("summary").tap()
  await expect(page.getByRole("checkbox", { name: "Audit Logs", exact: true })).toBeChecked()
  await expect(page.locator(".projects-grid article")).toHaveCount(1)
  await context.close()
})

test("Escape dismisses labels and returns keyboard focus to the trigger", async ({ page }) => {
  await page.goto("/es-ES/projects")
  const dropdown = page.locator(".projects-label-dropdown")
  const trigger = dropdown.locator("summary")
  await trigger.focus()
  await page.keyboard.press("Enter")
  await page.getByRole("checkbox", { name: "Audit Logs", exact: true }).focus()
  await page.keyboard.press("Space")
  await page.keyboard.press("Escape")
  await expect(dropdown).not.toHaveAttribute("open")
  await expect(trigger).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("checkbox", { name: "Audit Logs", exact: true })).toBeChecked()
})

test("unpublished project cards communicate their status first and stay non-interactive", async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    reducedMotion: "no-preference",
    viewport: { width: 1280, height: 900 }
  })
  const page = await context.newPage()
  for (const [locale, status] of [
    ["en-US", "Details coming soon"],
    ["pt-BR", "Detalhes em breve"],
    ["es-ES", "Detalles próximamente"]
  ]) {
    for (const path of ["/projects", ""]) {
      await page.goto(`/${locale}${path}`)
      const card = page
        .locator("article")
        .filter({ has: page.getByRole("heading", { name: "AccessTrace", exact: true }) })
      await expect(card.getByText(status, { exact: true })).toBeVisible()
      await expect(card.locator("a,button,input,summary,[tabindex='0']")).toHaveCount(0)
      const notice = await card.getByText(status, { exact: true }).boundingBox()
      const heading = await card.getByRole("heading").boundingBox()
      expect
        .soft(notice.y, `${locale}${path} publication status precedes the title`)
        .toBeLessThan(heading.y)
      if (path) {
        const image = card.locator("img")
        expect
          .soft(heading.y, `${locale} title precedes preview`)
          .toBeLessThan((await image.boundingBox()).y)
        await card.hover()
        expect.soft(await image.evaluate((node) => getComputedStyle(node).transform)).toBe("none")
      }
      await expect(
        page.getByRole("link", { name: "Jira → Toggl Quick Start", exact: true })
      ).toHaveAttribute("href", `/${locale}/projects/jira-toggl-quickstart`)
    }
  }
  await context.close()
})
