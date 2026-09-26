import { test, expect } from "@playwright/test"

test.use({ javaScriptEnabled: false })

for (const locale of ["en-US", "pt-BR", "es-ES"]) {
  test(`Hercília is featured and readable with images without JavaScript in ${locale}`, async ({
    page
  }) => {
    await page.goto(`/${locale}`)
    await page.getByRole("link", { name: "Hercília Construções", exact: true }).click()
    await expect(page).toHaveURL(`/${locale}/projects/hercilia-construcoes`)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hercília Construções")
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded()
      await expect(image).toBeVisible()
      await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBeGreaterThan(0)
    }
    const width = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(width).toBeLessThanOrEqual(page.viewportSize().width)
    await page.locator(".locale-dropdown summary").click()
    const nextLocale = locale === "en-US" ? "pt-BR" : "en-US"
    await page.locator(`.locale-dropdown [hreflang='${nextLocale}']`).click()
    await expect(page).toHaveURL(`/${nextLocale}/projects/hercilia-construcoes`)
  })
}
