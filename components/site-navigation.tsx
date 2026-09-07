"use client"

import type { Route } from "next"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { UiDictionary } from "@/data/i18n/types"
import { normalizePath } from "@/lib/locale-route"
import type { Locale } from "@/lib/i18n"

export function SiteNavigation({
  locale,
  labels,
  label
}: {
  locale: Locale
  labels: UiDictionary["nav"]
  label: string
}) {
  const pathname = normalizePath(usePathname())
  const rootPath = `/${locale}`

  return (
    <nav className="site-nav" aria-label={label}>
      {Object.entries(labels).map(([key, text]) => {
        const href = key === "home" ? rootPath : `${rootPath}/${key}`
        const isActive =
          key === "home"
            ? pathname === rootPath || pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={key}
            href={href as Route}
            className={`site-nav-link${isActive ? " site-nav-link-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {text}
          </Link>
        )
      })}
    </nav>
  )
}
