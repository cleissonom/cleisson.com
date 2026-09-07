# Blog PDFs and local writing skills

[README](../README.md) · [Development](development.md) · [Architecture](architecture.md)

Both skills are versioned in `.agents/skills/`, which Codex discovers for this
repository. They need no user-level settings, global installation, website runtime
dependency or build hook. A new turn picks them up; restart Codex if they are absent.

```text
$blog-to-pdf Refresh all published blog PDFs and validate every locale.
$blog-to-pdf Generate implementation-planning-vs-developing in pt-BR.
$humanizer Edit the prose in my new draft. Preserve facts, citations, code, frontmatter and link targets.
```

Humanizer is the actual upstream skill, installed for future editorial tasks. It
does not run during PDF conversion, tests or builds. See its
[provenance, pinned commit and update procedure](../.agents/skills/humanizer/UPSTREAM.md)
and preserved [MIT license](../.agents/skills/humanizer/LICENSE). Review editorial
diffs for facts and citations as well as unchanged code, metadata and link targets.

## Setup and commands

Use the [development prerequisites](development.md#setup-and-sources-of-truth): Node
from `.nvmrc`, within `package.json`'s supported range, and npm with the committed lockfile:

```bash
npm ci
npx playwright install chromium
npm run blog:pdf -- --slug implementation-planning-vs-developing --locale pt-BR
npm run blog:pdf
npm run blog:pdf -- --locale es-ES
npm run blog:pdf -- --force
npm run blog:pdf:check
```

Run from the repository root. `PLAYWRIGHT_CHANNEL=chrome npm run blog:pdf` uses an
existing Chrome installation instead of Playwright's pinned Chromium. Browser
installation needs network access; conversion itself is offline. The check command
does not launch a browser, change metadata or write files. It exits 1 for missing,
untracked, stale, damaged or orphaned outputs, missing sources or missing `pdfUrl`.
Invalid sources/assets/paths also exit 1 with an error. `--slug` requires `--locale`;
an unknown selection fails. `--check --force` is rejected.

Generation reuses React's static HTML renderer, `react-markdown`, `remark-gfm` and
the existing Playwright development dependency. The only new npm dependency is
development-only `pdf-lib@1.17.1`, used to validate PDF structure, set Unicode
metadata/language and normalize dates. The shared schema and YAML reader were
extracted from `lib/content.ts` into `lib/content-source.ts` without changing the
site's parsing behavior. TypeScript import extensions are enabled so Node 24 can
also import that module directly. No runtime PDF imports were added.

## Content and mapping contract

The site currently publishes **every `.md` file** under `content/blog/en-US`,
`content/blog/pt-BR` and `content/blog/es-ES`. There is no draft flag or scheduled
publication filter. Keep unpublished drafts outside these directories. The PDF
workflow uses the same schema, locale constants and URL conventions. It adds
generator checks for nonempty articles, filename/slug agreement, valid literal
ISO dates (`YYYY-MM-DD` or UTC ISO timestamps) and `updatedAt >= date`.

Existing `pdfUrl` values are authoritative, including translated filenames:

| Locale  | Current output below `public/downloads/blog/`          |
| ------- | ------------------------------------------------------ |
| `en-US` | `implementation-planning-vs-developing.en-US.pdf`      |
| `pt-BR` | `implementation-planning-vs-desenvolvimento.pt-BR.pdf` |
| `es-ES` | `implementation-planning-vs-desarrollo.es-ES.pdf`      |

Without `pdfUrl`, use `/downloads/blog/<slug>.<locale>.pdf`. After rendering
successfully, the generator inserts that one frontmatter field without serializing
or rewriting the rest of the file. Existing fields and prose are untouched. The
site's existing download button consumes this metadata; filesystem paths start
with `public/`, public URLs do not. Destination paths must be unencoded local PDF
paths inside the blog download directory. Traversal, symlinks and case-insensitive
destination collisions fail. Orphans are reported and never automatically removed.
If retiring a source/download intentionally, review the orphan and its manifest
entry before removing either manually.

The PDF includes the complete Markdown body plus the verified title, summary,
site author, publication/update dates and clickable localized source article URL.
Headings, lists, quotes, GFM tables/tasks/strikethrough, code, links and images use
the site's Markdown parser. Raw HTML is escaped, as on the site; article code and
scripts never execute. Relative links resolve against the source article URL.
The optional external `canonicalUrl` remains source metadata; the PDF always links
back to the actual localized article on this site.

Root-relative images resolve inside `public/`; relative images resolve beside
the Markdown source inside `content/blog/`. Supported formats are SVG, PNG, JPEG,
WebP, GIF and AVIF; animated images print a static frame. Assets are embedded locally.
Remote, missing, unreadable or unsupported images fail explicitly. SVGs must be
self-contained, without scripts or external dependencies. Local charts retain
their source proportions. Cover metadata does not insert a second cover image
when the article already contains its chart.

## Freshness, safe writes and repeatability

Commit/review generated PDFs together with `scripts/blog-pdf/manifest.json`.
The manifest records SHA-256 hashes of each PDF and its inputs: complete Markdown
and frontmatter, referenced image bytes, shared validation/localization/site/date
modules, renderer scripts, print CSS and `package-lock.json`. Including the whole
lockfile conservatively invalidates PDFs after dependency changes. Input hashes
use bytes, not mtimes. A matching PDF file alone never counts as current.

Generation skips current outputs. `--force` rerenders them for repeatability tests;
identical bytes are not rewritten. Chromium wall-clock metadata is replaced with
the article's publication/revision dates. PDFs and metadata updates are staged
under ignored `output/playwright/blog-pdf/` and atomically renamed individually.
A rendering/write failure cannot truncate a working PDF. A batch is not a
multi-file transaction: already completed posts remain valid if a later post
fails; rerun the command to finish. Interrupted manifest updates are detectable by
the checker. Do not run concurrent generators in the same checkout.

The batch captures its article, image, template and tool inputs before rendering.
If any captured input changes before publication, generation aborts; those edits
cannot be recorded as current against a PDF rendered from earlier content.

The manifest records browser version, platform, architecture, Node version and
browser channel for provenance. Hash checks are portable and require no browser.
Byte-for-byte rendering is verified within the same environment; different
operating-system font metrics, Chromium or Node/ICU versions can change pagination
or bytes. Use the same locked dependencies, Chromium revision and OS/font set when
comparing forced renders. System Arial/Helvetica and Courier fallbacks render all
three current Latin-script locales without shipping extra fonts. A new script or
locale needs font and visual validation. This is a tagged text PDF, not a PDF/A or
PDF/UA certification.

## Validate actual PDFs

```bash
npm run test:blog-pdf
npm run test:blog-pdf:render
npm run blog:pdf:check
npm run blog:pdf:review
python3 -m venv output/playwright/blog-pdf/venv
output/playwright/blog-pdf/venv/bin/python -m pip install pymupdf==1.28.2
output/playwright/blog-pdf/venv/bin/python scripts/blog-pdf/validate.py
```

Python/PyMuPDF is optional **review tooling**, not required for generation, builds
or the read-only check. The validator opens each PDF, compares every rendered
article text block against extracted text (including beginning, middle and end),
checks title, author, language, dates, source links, page numbers and text bounds,
then writes PNGs for **every page** and extracted text under
`output/playwright/blog-pdf/review/<slug>.<locale>/`. Inspect those PNGs for glyph
quality, readable images, clipped code/tables, stranded headings and awkward page
breaks; bounds/text checks alone cannot prove a good layout. Also open PDFs in a
viewer to exercise selection/search and clickable links. Poppler's `pdfinfo`,
`pdftotext` and `pdftoppm` are alternatives if already installed.

The unit suite runs as part of `npm test` without Chromium. It covers mapping,
all locales, metadata validation, YAML execution rejection, asset failures,
staleness and safe writes. The optional rendering integration test generates
temporary multilingual articles with long URLs, code, tables and multiple pages,
checks metadata/link annotations, compares forced render bytes, and verifies that
an unreadable image leaves every working PDF intact. It needs Chromium but no
server, credentials or network. CI runs the read-only check against committed PDFs.

After a deliberate content/asset/template edit, `npm run blog:pdf:check` must fail;
refresh and rerun it. For a temporary mutation probe, restore exact source bytes in
a `finally` block, do not generate from the probe, and confirm the final check passes.

## Troubleshooting

- **Browser executable missing:** run `npx playwright install chromium`, or choose
  installed Chrome with `PLAYWRIGHT_CHANNEL=chrome`. Linux may also need
  `npx playwright install --with-deps chromium` in the build/review environment.
- **Invalid dates/language/slug:** correct the identified source metadata. The PDF
  generator rejects impossible YAML dates that YAML would otherwise normalize.
- **Missing or remote image:** verify the local path and format, or provide a
  reviewed self-contained local asset. Conversion never fetches remote images.
- **Unreadable image / horizontal overflow:** inspect the identified image or
  article construct and the print template. Fix layout without rewriting prose or
  reducing it to an image. Very wide tables or unusual future constructs still
  require visual review.
- **Outdated or changed PDF:** run the generator, review all affected pages and
  retain the PDF plus manifest changes. Never edit hashes to bypass a mismatch.
- **Missing source or orphan:** inspect the mapping and source history. Preserve
  existing download URLs unless their removal is explicitly intended.
- **Interrupted generation:** rerun. Staging artifacts are outside public downloads;
  abandoned `staging-*` folders may be removed from the ignored review directory.

To update the PDF skill, edit its [instructions](../.agents/skills/blog-to-pdf/SKILL.md)
and canonical scripts/template together, run unit/render tests, regenerate affected
PDFs and review the resulting pages. Humanizer has a separate pinned update
procedure; never replace its upstream behavior with a locally invented prompt.
