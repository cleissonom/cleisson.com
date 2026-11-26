import { test, expect } from "@playwright/test"
import { projectCount } from "./project-count.mjs"

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
  await expect(page.locator(".projects-filter [role='status']")).toHaveText(
    `1 of ${projectCount("en-US")} projects`
  )
  await page.getByRole("button", { name: /clear/i }).click()
  await expect(dropdown).toHaveAttribute("open", "")
  await expect(page.locator(".projects-grid article")).toHaveCount(projectCount("en-US"))
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
