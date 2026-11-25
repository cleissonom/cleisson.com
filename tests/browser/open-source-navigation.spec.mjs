import { expect, test } from "@playwright/test"

test.use({ javaScriptEnabled: false })

for (const locale of ["en-US", "pt-BR", "es-ES"]) {
  test(`contributions are in the main navigation and games remain in the footer in ${locale}`, async ({
    page
  }) => {
    await page.goto(`/${locale}`)
    const navigation = page.locator("header nav")
    const contributions = `/${locale}/contributions`
    const games = `/${locale}/games`
    const primaryLink = navigation.locator(`a[href="${contributions}"]`)

    await expect(primaryLink).toBeVisible()
    await expect(navigation.locator(`a[href="${games}"]`)).toHaveCount(0)
    await expect(page.locator(`main a[href="${contributions}"]`)).toBeVisible()
    await primaryLink.click()
    await expect(primaryLink).toHaveAttribute("aria-current", "page")
    await expect(page.locator("main h1")).toBeVisible()

    await page.locator(`footer a[href="${games}"]`).click()
    await expect(page).toHaveURL(new RegExp(`/${locale}/games$`))
    await expect(page.locator("main h1")).toBeVisible()
  })
}
