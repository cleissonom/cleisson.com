import type { ReactNode } from "react"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "@/app/globals.css"

import { ThemeScript } from "@/components/theme-script"
import { rootMetadata } from "@/lib/metadata"

export const metadata = rootMetadata

export default function DefaultRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" suppressHydrationWarning data-theme="light">
      <head>
        <link rel="describedby" href="/llms.txt" />
        <link rel="service-desc" href="/openapi.json" type="application/json" />
        <link rel="service-doc" href="/en-US/mcp" />
      </head>
      <body>
        <ThemeScript />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
