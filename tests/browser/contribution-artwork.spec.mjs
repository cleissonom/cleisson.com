import { expect, test } from "@playwright/test"

for (const theme of ["light", "dark"]) {
  test(`each project has one readable identity and one working local mark in ${theme} mode`, async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto("/en-US/contributions")
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme)

    const contributions = page.locator("main li").filter({ has: page.locator("h2") })
    await expect(contributions).toHaveCount(3)
    for (const item of await contributions.all()) {
      const mark = item.locator("img:visible")
      await expect(mark).toHaveCount(1)
      await expect(mark).toHaveAttribute("alt", "")
      await mark.scrollIntoViewIfNeeded()
      const origin = await mark.evaluate(async (image) => {
        await image.decode()
        return new URL(image.currentSrc).origin
      })
      expect(origin).toBe(new URL(page.url()).origin)
      await expect(item.getByRole("link", { name: /Pull request #\d+/ })).toHaveCount(1)
    }
  })
}
