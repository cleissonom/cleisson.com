import { expect, test } from "@playwright/test"

import { getContributionGroups } from "../../data/contributions.ts"

const groups = getContributionGroups("en-US")

for (const theme of ["light", "dark"]) {
  test(`each repository has one readable identity, one working local mark and its pull requests in ${theme} mode`, async ({
    page
  }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto("/en-US/contributions")
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme)

    const repositories = page.locator("main details")
    await expect(repositories).toHaveCount(groups.length)
    for (const [index, item] of (await repositories.all()).entries()) {
      const mark = item.locator("summary img:visible")
      await expect(mark).toHaveCount(1)
      await expect(mark).toHaveAttribute("alt", "")
      await mark.scrollIntoViewIfNeeded()
      const origin = await mark.evaluate(async (image) => {
        await image.decode()
        return new URL(image.currentSrc).origin
      })
      expect(origin).toBe(new URL(page.url()).origin)

      const pullRequests = item.getByRole("link", { name: /Pull request #\d+/ })
      if (!(await item.evaluate((details) => details.open))) await item.locator("summary").click()
      await expect(pullRequests).toHaveCount(groups[index].contributions.length)
    }
  })
}
