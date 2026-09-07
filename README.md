# cleisson.com

Personal website and portfolio for Cleisson de Oliveira Moura, built with Next.js App Router and TypeScript.

## Features

- Locale-prefixed routes for `en-US`, `pt-BR`, and `es-ES`
- Automatic locale detection via cookie and `Accept-Language` header
- Markdown-based blog and project content with schema validation
- Localized resume pages and per-locale PDF files
- SEO artifacts: sitemap, robots, Open Graph metadata, JSON-LD, RSS/Atom/JSON feeds
- Security headers configured globally in `next.config.mjs`

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Zod
- gray-matter + react-markdown
- ESLint + Prettier + Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 24 (see `package.json` engines)
- npm

### Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Available Scripts

- `npm run dev`: Start dev server
- `npm run build`: Build for production
- `npm run start`: Run production server
- `npm test`: Run content and agent-readiness tests
- `npm run test:agent-readiness`: Run HTTP negotiation and public endpoint tests
- `npm run test:content`: Run content and static asset tests
- `npm run test:browser`: Run responsive/accessibility interaction regressions against a running production server
- `npm run test:performance`: Collect three cold-browser mobile samples per representative route and check payload budgets
- `npm run lint`: Run ESLint with `--max-warnings=0`
- `npm run lint:fix`: Auto-fix lint issues
- `npm run typecheck`: Run TypeScript type check
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check formatting
- `npm run precommit:checks`: Run staged secret scan + lint-staged checks

## Project Structure

```text
app/                 Next.js routes, layouts, SEO routes, feeds
components/          Shared UI components
content/             Markdown content (blog and projects) by locale
data/                Localized dictionaries and profile data
lib/                 Content loaders, i18n, metadata, feed builders
public/              Static assets (favicons, OG images, resumes)
proxy.ts             Locale routing and redirect logic
```

## Localization and Routing

Supported locales are defined in `lib/i18n.ts`:

- `en-US` (default)
- `pt-BR`
- `es-ES`

All main routes are locale-prefixed:

- `/{locale}`
- `/{locale}/about`
- `/{locale}/contact`
- `/{locale}/privacy`
- `/{locale}/projects`
- `/{locale}/projects/{slug}`
- `/{locale}/blog`
- `/{locale}/blog/{slug}`
- `/{locale}/resume`

`proxy.ts` applies this resolution order:

1. `locale` cookie
2. Browser `Accept-Language`
3. `en-US`

## Content Authoring

### Blog posts

Place files in `content/blog/{locale}/`.

Required frontmatter:

```yaml
---
title: Post title
slug: post-slug
summary: Short summary
date: 2026-01-15
updatedAt: 2026-01-20 # optional
tags:
  - Node.js
lang: en-US
---
```

### Projects

Place files in `content/projects/{locale}/`.

Required frontmatter:

```yaml
---
title: Project name
slug: project-slug
summary: Short summary
dateStart: 2025-01-01
dateEnd: 2025-12-31 # optional
role: Software Engineer
status: active # active | archived
tags:
  - Backend
stack:
  - Node.js
links:
  repo: https://example.com # optional
  live: https://example.com # optional
highlights:
  - Main result or impact
---
```

## SEO and Feed Endpoints

- `/llms.txt`
- `/sitemap.xml`
- `/robots.txt`
- `/rss.xml`
- `/atom.xml`
- `/feed.json`

## Verification

Before shipping changes:

```bash
npm run lint
npm run typecheck
npm run build
```

### Production browser verification

The browser harness uses Playwright as a development dependency. Install its Chromium browser once with `npx playwright install chromium`, or set `PLAYWRIGHT_CHANNEL=chrome` to use an existing Chrome installation. It never starts a development server or rebuilds the application. Build and start production first:

```bash
rtk proxy npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

In another terminal:

```bash
rtk proxy npm run test:browser
rtk proxy npm run test:performance
rtk proxy env AGENT_READINESS_BASE_URL=http://127.0.0.1:3100 node --test tests/agent-readiness/endpoints.test.mjs
```

Set `BROWSER_BASE_URL` for another local port. Browser regressions cover the five responsive widths (320/360/390/768/1440px), all three locales and both themes, plus the three-column project grid at 1024/1280/1440px. They check keyboard/touch filtering, skip focus, localized navigation/recovery, contrast, finite orbital motion, stationary link targets during image feedback, reduced motion, enlarged text and unavailable JavaScript. The suite checks observable behavior and layout; it does not certify WCAG conformance. Review final desktop/mobile appearance, screen-reader behavior and actual browser zoom separately.

Artifacts are ignored under `output/playwright/`. Performance writes `performance.json`; set `PERFORMANCE_OUTPUT=output/playwright/before-performance.json` to retain a baseline before changes. Compare before/after production builds on the same browser and machine without other browser/build workloads running.

Each performance run uses fresh browser contexts, disabled browser cache, 390×844 CSS pixels/DPR 2, 4× CPU slowdown, 150ms emulated latency, 200,000 B/s download and 93,750 B/s upload, and a fixed four-second window after load. Three samples each cover home, projects and the article. Resource Timing distinguishes initial HTML script URLs from speculative JavaScript/RSC, records encoded body bytes separately from transfer bytes, and records LCP, observed shifts and long tasks. The server and image cache remain warm; localhost document latency and missing deployed telemetry limit comparison with real networks. These are local lab measurements, not field INP or complete page-lifetime CLS.

The command fails on payload budget violations: initial transfer ≤250 KiB (projects ≤350 KiB), full window ≤500 KiB, initial encoded JS ≤160 KiB, all JS ≤180 KiB, CSS ≤8 KiB, zero downloaded fonts, speculation ≤40 KiB, and home above-fold images ≤60 KiB with portrait ≤40 KiB. Timing is reported without a flaky machine-specific timing gate. Set `PERFORMANCE_STRESS=1` for a separate 6× CPU, 300ms latency, 50,000 B/s download stress run. Field targets remain p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1; verify these on deployed telemetry separately.

## Deployment

No project-specific environment variables are required for local or production builds at this time.
