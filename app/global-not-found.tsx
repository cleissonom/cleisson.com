import "@/app/globals.css"

import Link from "next/link"

import { SITE_NAME } from "@/lib/site"

export default function GlobalNotFound() {
  return (
    <html lang="en-US" data-theme="light">
      <head>
        <title>{`Page not found | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content="The requested page does not exist. Use the recovery links to continue."
        />
        <meta name="robots" content="noindex, follow" />
      </head>
      <body>
        <main className="container not-found">
          <h1>Page not found</h1>
          <p>The page you requested does not exist. Choose a verified route below.</p>
          <div className="not-found-actions">
            <Link className="primary-button" href="/en-US">
              Go to home
            </Link>
            <a className="secondary-button" href="/sitemap.xml">
              Sitemap
            </a>
            <a className="ghost-button" href="/llms.txt">
              Agent instructions
            </a>
            <Link className="ghost-button" href="/en-US/projects">
              Projects
            </Link>
            <Link className="ghost-button" href="/en-US/blog">
              Blog
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
