import { chromium } from "@playwright/test"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"

const baseURL = process.env.BROWSER_BASE_URL || "http://127.0.0.1:3100"
const output = process.env.PERFORMANCE_OUTPUT || "output/playwright/performance.json"
const stress = process.env.PERFORMANCE_STRESS === "1"
const routes = ["/en-US", "/en-US/projects", "/en-US/blog/implementation-planning-vs-developing"]
const conditions = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  cpuSlowdown: stress ? 6 : 4,
  latency: stress ? 300 : 150,
  downloadThroughput: stress ? 50000 : 200000,
  uploadThroughput: 93750,
  observationWindowMs: 4000,
  samplesPerRoute: 3,
  cache: "cold browser; warm local server"
}

function observeMetrics() {
  window.designMetrics = { lcp: 0, lcpElement: null, layoutShifts: [], longTasks: [] }
  for (const type of ["largest-contentful-paint", "layout-shift", "longtask"]) {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (type === "largest-contentful-paint") {
          window.designMetrics.lcp = entry.startTime
          window.designMetrics.lcpElement = {
            tag: entry.element?.tagName,
            text: entry.element?.textContent?.slice(0, 120),
            url: entry.url
          }
        }
        if (type === "layout-shift" && !entry.hadRecentInput)
          window.designMetrics.layoutShifts.push(entry.value)
        if (type === "longtask") window.designMetrics.longTasks.push(entry.duration)
      }
    }).observe({ type, buffered: true })
  }
}

async function preparePage(browser) {
  const context = await browser.newContext({
    viewport: conditions.viewport,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  })
  const page = await context.newPage()
  await page.addInitScript(observeMetrics)
  const session = await context.newCDPSession(page)
  await session.send("Network.enable")
  await session.send("Network.setCacheDisabled", { cacheDisabled: true })
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: conditions.latency,
    downloadThroughput: conditions.downloadThroughput,
    uploadThroughput: conditions.uploadThroughput
  })
  await session.send("Emulation.setCPUThrottlingRate", { rate: conditions.cpuSlowdown })
  return { context, page }
}

function collectResources(initialScripts) {
  const scripts = new Set(initialScripts)
  const navigation = performance.getEntriesByType("navigation")[0]
  const resources = performance.getEntriesByType("resource").map((entry) => ({
    url: entry.name,
    initiator: entry.initiatorType,
    transferBytes: entry.transferSize,
    encodedBytes: entry.encodedBodySize,
    initialScript: scripts.has(entry.name)
  }))
  const aboveFoldImages = [...document.images]
    .filter((image) => image.getBoundingClientRect().top < innerHeight)
    .map((image) => image.currentSrc)
  return {
    ...window.designMetrics,
    ttfb: navigation.responseStart - navigation.requestStart,
    navigation: {
      transferBytes: navigation.transferSize,
      encodedBytes: navigation.encodedBodySize
    },
    resources,
    aboveFoldImages
  }
}

function summarize(sample, route) {
  const sum = (predicate, key = "encodedBytes") =>
    sample.resources.filter(predicate).reduce((total, resource) => total + resource[key], 0)
  const isJS = (resource) => /\.js(?:\?|$)/.test(resource.url)
  const speculative = (resource) =>
    resource.url.includes("_rsc=") ||
    (isJS(resource) && !resource.initialScript && !resource.url.includes("_vercel/"))
  const initial =
    sample.navigation.transferBytes + sum((resource) => !speculative(resource), "transferBytes")
  const total = sample.navigation.transferBytes + sum(() => true, "transferBytes")
  const values = {
    initialTransferBytes: initial,
    totalTransferBytes: total,
    initialJSEncodedBytes: sum((resource) => isJS(resource) && resource.initialScript),
    allJSEncodedBytes: sum(isJS),
    cssEncodedBytes: sum((resource) => /\.css(?:\?|$)/.test(resource.url)),
    fontEncodedBytes: sum((resource) => /\.(woff2?|ttf|otf)(?:\?|$)/.test(resource.url)),
    imageEncodedBytes: sum(
      (resource) => resource.initiator === "img" || resource.url.includes("/_next/image")
    ),
    aboveFoldImageEncodedBytes: sum((resource) => sample.aboveFoldImages.includes(resource.url)),
    portraitEncodedBytes: sum((resource) =>
      decodeURIComponent(resource.url).includes("/about/profile.webp")
    ),
    speculativeEncodedBytes: sum(speculative),
    maxLongTaskMs: Math.max(0, ...sample.longTasks)
  }
  const limits = {
    initialTransferBytes: (route.endsWith("/projects") ? 350 : 250) * 1024,
    totalTransferBytes: 500 * 1024,
    initialJSEncodedBytes: 160 * 1024,
    allJSEncodedBytes: 180 * 1024,
    cssEncodedBytes: 8 * 1024,
    fontEncodedBytes: 0,
    ...(route === "/en-US"
      ? { aboveFoldImageEncodedBytes: 60 * 1024, portraitEncodedBytes: 40 * 1024 }
      : {}),
    speculativeEncodedBytes: 40 * 1024
  }
  return {
    ...values,
    budgetFailures: Object.entries(limits)
      .filter(([key, limit]) => values[key] > limit)
      .map(([key, limit]) => ({ metric: key, actual: values[key], limit }))
  }
}

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chromium" })
const results = []
try {
  for (const route of routes) {
    for (let run = 1; run <= conditions.samplesPerRoute; run++) {
      const { context, page } = await preparePage(browser)
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "load" })
      const html = await response.text()
      const initialScripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(
        (match) => new URL(match[1], baseURL).href
      )
      // A fixed observation window makes speculative loading comparable across builds.
      await page.waitForTimeout(conditions.observationWindowMs)
      const sample = await page.evaluate(collectResources, initialScripts)
      const result = { route, run, ...sample, summary: summarize(sample, route) }
      results.push(result)
      console.log(JSON.stringify({ route, run, lcp: sample.lcp, ...result.summary }))
      await context.close()
    }
  }
  await mkdir(dirname(output), { recursive: true })
  await writeFile(
    output,
    `${JSON.stringify({ browser: browser.version(), conditions, baseURL, results }, null, 2)}\n`
  )
  console.log(`Saved ${output}; local lab results exclude deployed telemetry and field INP.`)
  if (results.some((result) => result.summary.budgetFailures.length)) process.exitCode = 1
} finally {
  await browser.close()
}
