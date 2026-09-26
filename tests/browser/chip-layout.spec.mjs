import { test, expect } from "@playwright/test"

test.use({ javaScriptEnabled: false })

function measureChips(nodes) {
  return nodes.map((node) => {
    const style = getComputedStyle(node)
    const text = document.createRange()
    text.selectNodeContents(node)
    const lineHeight = Number.parseFloat(style.lineHeight)
    const lines = Math.ceil(text.getBoundingClientRect().height / lineHeight)
    const edges = ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"]
    return {
      text: node.textContent,
      height: node.getBoundingClientRect().height,
      contentHeight:
        lines * lineHeight + edges.reduce((sum, key) => sum + parseFloat(style[key]), 0)
    }
  })
}

for (const width of [390, 1440]) {
  for (const locale of ["en-US", "pt-BR", "es-ES"]) {
    test(`metadata labels fit their text at ${width}px in ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`/${locale}/projects`)
      const projects = await page
        .locator(".projects-grid h2 a")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href")))
      expect(projects.length).toBeGreaterThan(0)
      const pages = ["", "/projects", "/blog", "/about", "/experience", "/resume"]
      const routes = [
        ...projects,
        ...pages.map((path) => `/${locale}${path}`),
        `/${locale}/blog/implementation-planning-vs-developing`
      ]
      for (const route of routes) {
        await page.goto(route)
        const chips = await page.locator("main span.chip").evaluateAll(measureChips)
        expect(chips.length, route).toBeGreaterThan(0)
        for (const chip of chips) {
          expect
            .soft(chip.height, `${route}: ${chip.text}`)
            .toBeLessThanOrEqual(chip.contentHeight + 1)
        }
      }
    })
  }
}
