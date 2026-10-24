import { test, expect } from "@playwright/test"

const gamePath = "/en-US/games/falling-blocks"
const storageKey = "falling-blocks.best-score"
const stat = (page, label) =>
  page
    .locator(".falling-blocks-hud > div")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd")

test("a personal best survives restart, reload, and changing locale", async ({ page }) => {
  await page.goto(gamePath)
  await expect(stat(page, "Best score")).toHaveText("0")
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await page.keyboard.press("Space")
  await expect(stat(page, "Score")).not.toHaveText("0")
  const points = await stat(page, "Score").textContent()
  await expect(stat(page, "Best score")).toHaveText(points)
  await page.keyboard.press("KeyR")
  await expect(stat(page, "Score")).toHaveText("0")
  await expect(stat(page, "Best score")).toHaveText(points)
  await page.reload()
  await expect(stat(page, "Best score")).toHaveText(points)
  await expect(stat(page, "Score")).toHaveText("0")
  await page.goto("/pt-BR/games/falling-blocks")
  await expect(stat(page, "Recorde")).toHaveText(points)
  await page.goto("/es-ES/games/falling-blocks")
  await expect(stat(page, "Récord")).toHaveText(points)
})

test("a lower score never replaces a higher saved record", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await page.addInitScript(({ key }) => localStorage.setItem(key, "4294967295"), {
    key: storageKey
  })
  await page.goto(gamePath)
  await expect(stat(page, "Best score")).toHaveText("4,294,967,295")
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await page.keyboard.press("Space")
  await expect(stat(page, "Score")).not.toHaveText("0")
  await expect(stat(page, "Best score")).toHaveText("4,294,967,295")
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe("4294967295")
  expect(
    await stat(page, "Best score").evaluate((element) => element.scrollWidth <= element.clientWidth)
  ).toBe(true)
})

for (const storageFailure of ["read", "write"]) {
  test(`play continues when local storage ${storageFailure}s fail`, async ({ page }) => {
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.addInitScript((failure) => {
      const method = failure === "read" ? "getItem" : "setItem"
      Storage.prototype[method] = () => {
        throw new DOMException("Blocked", "SecurityError")
      }
    }, storageFailure)
    await page.goto(gamePath)
    await page.getByRole("button", { name: "Start", exact: true }).click()
    await page.keyboard.press("Space")
    await expect(stat(page, "Score")).not.toHaveText("0")
    const points = await stat(page, "Score").textContent()
    await expect(stat(page, "Best score")).toHaveText(points)
    await page.keyboard.press("KeyR")
    await expect(stat(page, "Best score")).toHaveText(points)
    expect(errors).toEqual([])
  })
}
