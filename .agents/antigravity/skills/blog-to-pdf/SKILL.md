---
name: blog-to-pdf
description: Generates, refreshes, and verifies cleisson.com localized blog PDFs and their download metadata. Applies to PDF freshness and visual review while preserving source prose.
---

# Blog PDFs

Use repository-owned [PDF tooling](../../../../scripts/blog-pdf/) and the canonical
[PDF guide](../../../../docs/blog-pdfs.md). Run all commands from this repository
root. PDF conversion reproduces Markdown; editorial rewriting is a separate task.

## Workflow

1. Read applicable instructions and the PDF guide. Inspect the working tree,
   selected Markdown, images, and existing `pdfUrl` mappings. Use declared Node,
   npm, and the committed lockfile. For available options run
   `npm run blog:pdf -- --help`; it does not generate PDFs.
2. Run `npm run blog:pdf:check`. It is read-only and needs no browser/network;
   missing, stale, damaged, untracked, or orphaned outputs and invalid sources
   fail explicitly. For check-only requests, report these findings without
   generating or changing metadata.
3. For generation, use `npm run blog:pdf` for all published locales, or
   `npm run blog:pdf -- --locale pt-BR --slug <slug>` for one article. A locale
   alone selects that locale; a slug requires a locale. Generation needs
   Playwright Chromium, or installed Chrome with `PLAYWRIGHT_CHANNEL=chrome`.
   Use `--force` for rerenders, never with `--check`. Run only one generator per
   checkout.
4. Review PDFs and `scripts/blog-pdf/manifest.json` together. Existing `pdfUrl`
   mappings remain authoritative; only missing metadata is inserted after a
   successful render. Investigate orphans/missing sources without silently
   deleting downloads, changing public URLs, or editing hashes to hide failures.
5. After affected generation or tooling edits, run `npm run test:blog-pdf` and
   `npm run test:blog-pdf:render`, then the PDF guide's review commands. Inspect
   every affected locale's actual pages for images, code/tables, and page breaks.
   Compare forced-render hashes in the same runtime/font environment and finish
   with `npm run blog:pdf:check`.
6. Report saved paths, metadata changes, completed checks, and rendering limits.
   Keep optional PyMuPDF environments and page previews under ignored
   `output/playwright/blog-pdf/`.

## Conversion boundaries

Use the site's publication rules: currently every `.md` in a supported locale
is published with no draft/future-date filter. Do not invent a PDF-only policy.
Do not summarize, translate, humanize, execute article code, or rewrite prose.
Missing or remote images are errors; resolve reviewed local assets explicitly.

Preserve existing download paths, localized metadata, and failure-safe writes.
A batch may complete earlier PDFs before a later failure; fix the cause and rerun
without destroying completed outputs. Tooling belongs outside website bundles
and request handlers. Humanizer is never part of conversion, tests, or builds.
