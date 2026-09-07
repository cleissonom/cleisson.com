import { PDFDocument } from "pdf-lib"
import { SITE_NAME } from "../../lib/site.ts"
import { footerTemplate } from "./document.mjs"

async function normalizeMetadata(bytes, post) {
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false })
  if (!pdf.getPageCount()) throw new Error(`Empty PDF: ${post.source}`)
  pdf.setTitle(post.title)
  pdf.setAuthor(SITE_NAME)
  pdf.setSubject(`${post.summary}\n${post.sourceUrl}`)
  pdf.setKeywords(post.tags)
  pdf.setLanguage(post.locale)
  pdf.setCreator("cleisson.com blog-to-pdf")
  pdf.setProducer("Chromium / pdf-lib")
  // These represent publication/revision, never the generation wall clock.
  pdf.setCreationDate(new Date(post.date))
  pdf.setModificationDate(new Date(post.updatedAt ?? post.date))
  return Buffer.from(await pdf.save())
}

async function validatePage(page, source) {
  const errors = await page.evaluate(async () => {
    await document.fonts.ready
    const problems = []
    for (const img of document.images) {
      try {
        await img.decode()
      } catch {
        problems.push(`Unreadable image: ${img.alt}`)
      }
    }
    const width = document.documentElement.clientWidth
    for (const element of document.querySelectorAll("article *")) {
      const rect = element.getBoundingClientRect()
      if (
        rect.right > width + 1 ||
        rect.left < -1 ||
        (element.scrollWidth > element.clientWidth + 2 &&
          getComputedStyle(element).display !== "inline")
      )
        problems.push(`Horizontal overflow: ${element.tagName}`)
    }
    return problems
  })
  if (errors.length) throw new Error(`${source}: ${[...new Set(errors)].join(", ")}`)
}

export async function renderPdf(browser, document) {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    locale: document.post.locale,
    viewport: { width: 650, height: 980 },
    serviceWorkers: "block"
  })
  const requests = []
  try {
    await page.route("**/*", (route) => {
      requests.push(route.request().url())
      return route.abort()
    })
    await page.emulateMedia({ media: "print", reducedMotion: "reduce", colorScheme: "light" })
    await page.setContent(document.html, { waitUntil: "load" })
    await validatePage(page, document.post.source)
    if (requests.length) throw new Error(`Unexpected network/asset request: ${requests.join(", ")}`)
    const bytes = await page.pdf({
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: footerTemplate(document.post.locale),
      margin: { top: "18mm", right: "19mm", bottom: "20mm", left: "19mm" }
    })
    return await normalizeMetadata(bytes, document.post)
  } finally {
    await page.close()
  }
}
