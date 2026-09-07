<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent and AI accessibility

Treat agents and AI systems as first-class consumers of this site. Every canonical public page must remain useful without client-side JavaScript through complete semantic server-rendered HTML and an equivalent Markdown representation via `Accept: text/markdown` content negotiation and an explicit `.md` URL.

When public content or routes change, keep `llms.txt`, sitemap entries, discovery links and metadata, locale routing, structured data where applicable, and agent-readiness tests in sync. Keep machine-facing claims factual, localized, source-linked, and explicit about provenance, uncertainty, limitations, and missing public evidence.

Keep the REST API, OpenAPI document, public API documentation, and equivalent MCP tools synchronized whenever public professional evidence changes.

## Local skills and blog downloads

Project-local Codex skills live in `.agents/skills/`. Use `blog-to-pdf` for static
blog downloads and follow `docs/blog-pdfs.md`. After changing published article
content, PDF metadata, referenced images or print tooling, run `npm run blog:pdf`
and `npm run blog:pdf:check`; review the PDFs and manifest together. CI checks
freshness without launching a browser. Keep review artifacts in ignored
`output/playwright/blog-pdf/`.

Humanizer is vendored with pinned provenance for future editorial tasks. Preserve
its upstream files and license when updating it. Never invoke it during PDF
conversion or builds; editorial use must preserve facts, citations, code,
frontmatter and link targets.
