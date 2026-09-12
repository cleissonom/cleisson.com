---
name: blog-to-pdf
description: Generate, refresh, or verify cleisson.com localized blog PDFs and their download metadata. Use for PDF freshness and visual review while preserving source prose.
---

# Blog PDFs

Produce complete static downloads from `content/blog` into `public/downloads/blog`
without editorial changes. Run commands from this repository root; canonical
[PDF tooling](../../../../scripts/blog-pdf/) stays outside website bundles and
request handlers. The [PDF guide](../../../../docs/blog-pdfs.md) owns setup,
validation, publication rules, and troubleshooting.

Use the Node version declared in `.nvmrc` and `package.json`, npm with its lockfile,
and installed dependencies. Generation uses Playwright Chromium; installed Chrome
can be selected with `PLAYWRIGHT_CHANNEL=chrome`. Read-only checks need no browser
or network. `npm run blog:pdf -- --help` lists supported options without generating.

For freshness work, `npm run blog:pdf:check` identifies missing, stale, damaged,
untracked, or orphaned outputs and invalid sources without writing files.
For generation, `npm run blog:pdf` covers all published locales; scope with
`-- --locale pt-BR --slug <slug>` or select a whole locale. `--slug` requires
`--locale`; `--force` rerenders selected outputs and cannot accompany `--check`.
Do not run concurrent generators in one checkout.

Existing `pdfUrl` mappings are authoritative. The generator defaults missing URLs
to `<slug>.<locale>.pdf` and inserts only missing metadata after a successful render.
Review metadata changes, PDFs, and `scripts/blog-pdf/manifest.json` together.
Investigate orphans or missing sources; never silently remove published downloads
or hand-edit manifest hashes. Publication follows the site's rules; currently
every `.md` file in supported locale directories is published, with no draft or
future-date filter.

Treat Markdown as the complete source: do not summarize, translate, humanize,
execute article code, or rewrite prose. Missing/remote images are errors; resolve
reviewed local assets rather than dropping them. Preserve paths, localized URLs,
metadata, and failure-safe writes. A batch can partially succeed; rerun after
fixing the cause, preserving completed outputs.

After affected generation or tooling changes, use the guide's unit/render checks
and inspect actual pages in every affected locale, including long code/tables,
images, and page boundaries. Check reproducibility with forced renders and hashes
within the same runtime/font environment, then rerun freshness verification.
Use optional PyMuPDF review tools when useful; keep previews, PNGs, and Python
environments under ignored `output/playwright/blog-pdf/`. Report actual paths,
metadata wiring, completed checks, and rendering limitations.
