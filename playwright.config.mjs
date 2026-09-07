import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  timeout: 15000,
  expect: { timeout: 3000 },
  reporter: "list",
  outputDir: "output/playwright/test-results",
  use: {
    baseURL: process.env.BROWSER_BASE_URL || "http://127.0.0.1:3100",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
})
