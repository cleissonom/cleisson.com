---
name: blog-to-pdf
description: Generate, refresh, check, or visually validate this repository's localized blog PDFs from content/blog into public/downloads/blog. Use for static article downloads and PDF freshness work; preserve source prose without editorial rewriting.
---

Run from the cleisson.com repository root. The working generator lives in
[`scripts/blog-pdf/`](../../../scripts/blog-pdf/), outside website bundles and request handlers.
Read [`docs/blog-pdfs.md`](../../../docs/blog-pdfs.md) for setup, validation and troubleshooting.

Prerequisites: Node 24, `npm ci`, and `npx playwright install chromium` for generation.
An installed Chrome can be selected with `PLAYWRIGHT_CHANNEL=chrome`. Checking requires
no browser download or network. PyMuPDF is optional for text extraction and page rendering.

1. Read applicable instructions and inspect the current sources, `pdfUrl` mappings,
   and working tree. The site publishes every `.md` file in each supported locale;
   it currently has no draft or future-date filter. Follow the site's publication
   rules if they change; never invent a separate PDF publication policy.
2. Run `npm run blog:pdf:check` to identify missing, changed or outdated downloads
   and orphaned PDFs. This command does not modify files and exits 1 on problems.
3. Generate one post and locale:

   ```bash
   npm run blog:pdf -- --slug implementation-planning-vs-developing --locale pt-BR
   ```

   Generate all published locales with `npm run blog:pdf`; use `--force` to render
   every selected PDF again. `--locale es-ES` selects a whole locale.

4. Preserve existing download URLs. The generator validates destinations under
   `public/downloads/blog`, defaults to `<slug>.<locale>.pdf`, and inserts only a
   missing `pdfUrl` after successful rendering. Review these narrow metadata changes.
   Investigate reported orphans or missing sources; never silently delete downloads.
5. Run `npm run test:blog-pdf`, `npm run test:blog-pdf:render`, then the PDF review
   commands in the guide. Inspect actual rendered PDF pages across every affected
   locale, including images, long code/tables and page boundaries. Repeat generation
   with `--force`, compare hashes and rerun `npm run blog:pdf:check`.
6. Report output paths, metadata wiring, actual checks and any rendering limitations.
   Include the generated PDFs and `scripts/blog-pdf/manifest.json` together in review.

Treat Markdown as the complete source of truth. Do not summarize, translate,
humanize, execute article code, or change prose during conversion. Humanizer is an
independent editorial skill and is never part of this workflow. Missing or remote
images are errors; resolve local assets explicitly instead of silently dropping them.
Keep previews, PNGs and Python environments under ignored `output/playwright/blog-pdf/`.
