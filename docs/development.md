# Development and tooling

[README](../README.md) · [Architecture](architecture.md) · [Operations](operations.md)

## Setup and sources of truth

Run commands from the repository root; content loaders and scripts resolve paths from the working directory.

| Setting                    | Authority                                                                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node baseline              | [`.nvmrc`](../.nvmrc), also read by GitHub Actions; [`package.json`](../package.json) `engines.node` defines the supported range                                     |
| Dependencies and commands  | [`package.json`](../package.json) and [`package-lock.json`](../package-lock.json); use npm, not another lockfile. npm itself is not pinned                           |
| Framework behavior         | Installed `node_modules/next/dist/docs/`, [`next.config.mjs`](../next.config.mjs), [`AGENTS.md`](../AGENTS.md)                                                       |
| Types, lint and formatting | [`tsconfig.json`](../tsconfig.json), [`eslint.config.mjs`](../eslint.config.mjs), [`.prettierrc.json`](../.prettierrc.json), [`.prettierignore`](../.prettierignore) |
| CI and production delivery | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml); [`vercel.json`](../vercel.json) adds provider routing/Git settings                                        |
| Environment variables      | Actual reads in source and CI; names, purpose and scope in the [operations inventory](operations.md#environment-variables)                                           |
| Ignored artifacts          | [`.gitignore`](../.gitignore); `.next/`, `.vercel/`, `.devimg/`, `output/playwright/` and local env files are not source                                             |

Prerequisites: matching Node, npm and Git. `nvm use` selects the checked-in baseline if nvm is installed. Run `npm ci`, then `npm run dev`, and open <http://localhost:3000>. Expected result: localized pages render without application credentials or an environment file. `npm ci` restores the lockfile dependency tree and runs `prepare` to install Husky hooks. It can replace an existing local dependency installation; preserve any intentional local dependency work first.

No environment example is needed for the current application. Never copy deployment credentials into a browser-visible variable or repository file. Provider CLIs and browser/Python review tools are separate from a basic development installation.

## Tool inventory

Repository verification establishes the following roles. Provider enablement/data receipt is covered separately in [operations](operations.md).

| Tool                                          | Purpose and configuration                                                                                  | Required where                                                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Next.js, React, TypeScript                    | Application framework/types; `app/`, `next.config.mjs`, `tsconfig.json`                                    | Framework/runtime dependencies and build tooling                                                                    |
| gray-matter, Zod, react-markdown, remark-gfm  | YAML/schema validation and Markdown rendering; `lib/content*.ts`, page components                          | Application; shared by PDF tooling                                                                                  |
| MCP server SDK                                | Public protocol implementation in `lib/mcp-server.ts`, `app/api/mcp/route.ts`                              | Application runtime                                                                                                 |
| MCP client SDK                                | Protocol regression tests under `tests/agent-readiness/`                                                   | Development/tests only                                                                                              |
| Vercel Analytics and Speed Insights SDKs      | Mounted in the two app layouts                                                                             | Included in deployed UI; not needed for core page content                                                           |
| ESLint, TypeScript ESLint, Next ESLint config | Static checks through `eslint.config.mjs`                                                                  | Development and CI                                                                                                  |
| Prettier                                      | Formatting through `.prettierrc.json`; generated/vendor exclusions in `.prettierignore`                    | Development/hooks; standalone check is not currently a CI step                                                      |
| Husky and lint-staged                         | `prepare` installs `.husky/pre-commit`; staged tasks in `package.json`                                     | Local commit workflow; no runtime role                                                                              |
| Gitleaks                                      | Default rules extended by `.gitleaks.toml`; hook scans staged content, CI scans Git history with redaction | Local commits and CI; binary version pinned in CI                                                                   |
| Python pre-commit                             | `.pre-commit-config.yaml` offers a Gitleaks hook                                                           | Optional alternative configuration; no evidence it is installed as the active Git hook. Husky is the npm-owned path |
| DevImg                                        | Three `devimg.*.toml` configs, generated manifests/exports, shared `scripts/check-images.sh`               | Image maintenance and CI; external CLI, no website runtime dependency                                               |
| Playwright                                    | `playwright.config.mjs`, `tests/browser/`, PDF renderer/integration tests                                  | Optional specialized local checks; not required by `npm test` or production                                         |
| pdf-lib                                       | PDF structure, metadata and freshness tooling under `scripts/blog-pdf/`                                    | Development-only dependency                                                                                         |
| Python/PyMuPDF                                | `scripts/blog-pdf/validate.py` extracts text and renders review pages                                      | Optional PDF review; setup in [PDF guide](blog-pdfs.md)                                                             |
| Next bundle analyzer                          | `ANALYZE` flag in `next.config.mjs`                                                                        | Optional local analysis through `npm run analyze`; not CI                                                           |
| Vercel CLI                                    | CI pulls project settings, builds and uploads prebuilt output                                              | Production delivery tooling; not required for ordinary local development                                            |
| RTK                                           | Optional local command-output wrapper used by repository agent instructions                                | Agent environment only; not an npm or production dependency. Use `rtk proxy <command>` when exact output matters    |

Do not remove `.pre-commit-config.yaml` merely because Husky is active, or infer service usage from transitive/local packages. Check references and owner workflows first. CI pins the DevImg Action and Gitleaks binary, while its Vercel CLI uses `@latest`; the latter is a maintenance consideration, unchanged by this cleanup.

## Commands and quality checks

The package script names below are stable entry points. Read `package.json` for their exact implementation.

| Workflow              | Commands and prerequisites                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Serve                 | `npm run dev`; or `npm run build` followed by `npm run start`                                                                                |
| Core regression tests | `npm test`; narrower `npm run test:content` and `npm run test:agent-readiness`                                                               |
| Code checks           | `npm run lint`, `npm run typecheck`, `npm run format:check`                                                                                  |
| Intentional fixes     | `npm run lint:fix`, `npm run format`; inspect the resulting diff because these write files                                                   |
| Image checks          | `npm run images:check`, or `npm run images:check -- blog seo`; DevImg required, no regeneration                                              |
| PDF checks            | `npm run blog:pdf:check`, `npm run test:blog-pdf`; no browser required                                                                       |
| PDF generation/review | `npm run blog:pdf`, `npm run blog:pdf:review`, `npm run test:blog-pdf:render`; [PDF guide](blog-pdfs.md) owns prerequisites and safety steps |
| Browser/performance   | `npm run test:browser`, `npm run test:performance`; production server and Chromium required                                                  |
| Bundle analysis       | `npm run analyze`; optional diagnostic build                                                                                                 |
| Hooks                 | `npm run precommit:checks` runs `precommit:secrets` then `precommit:lint`; requires Gitleaks and staged files                                |

For a typical change, run:

```bash
npm test
npm run blog:pdf:check
npm run images:check
npm run lint
npm run typecheck
npm run format:check
npm run build
```

Expected result: each command exits zero, public content/download contracts pass, and the production build completes. Run focused checks while developing, then the applicable broader checks before handoff. Behavior changes require the test-first workflow in the applicable instructions; use existing passing contracts for behavior-preserving cleanup. Do not refresh generated assets just to hide a freshness failure.

CI additionally scans secrets and verifies DevImg AI dry-runs. It runs the core tests, PDF freshness, lint, typecheck and build. Browser/performance/PDF rendering integration checks and standalone Prettier checks are local procedures, not currently CI checks. A successful build alone does not establish that the other checks ran.

## Production browser and performance checks

Prerequisites: installed dependencies and Playwright Chromium (`npx playwright install chromium`), or an existing Chrome selected with `PLAYWRIGHT_CHANNEL=chrome`. The harness never starts a server or rebuilds. In one terminal:

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

In another terminal:

```bash
npm run test:browser
npm run test:performance
AGENT_READINESS_BASE_URL=http://127.0.0.1:3100 node --test tests/agent-readiness/endpoints.test.mjs
```

Expected result: browser contracts and payload budgets pass; the HTTP suite validates the local production server. Use `BROWSER_BASE_URL` and `AGENT_READINESS_BASE_URL` for another **local** port. The endpoint suite sends a test POST to `/_vercel/insights/view`; it is not a read-only production smoke test. MCP regression tests also exercise malformed requests and rate limits. Use the [GET/HEAD deployment smoke procedure](operations.md#post-deployment-smoke-checks) for a live site.

Browser tests cover responsive widths, all locales and themes, keyboard/touch filtering, skip focus, navigation/recovery, contrast, finite motion, stationary link targets, reduced motion, enlarged text and unavailable JavaScript. Exact cases live in [`tests/browser/`](../tests/browser/). Passing tests do not certify WCAG conformance; review final appearance, screen-reader behavior and real browser zoom when changing UI.

[`tests/browser/performance.mjs`](../tests/browser/performance.mjs) is authoritative for sample routes, emulation settings and byte budgets. It takes three fresh mobile-browser samples per representative route, separates initial HTML scripts from speculative JS/RSC, and reports LCP, observed shifts and long tasks. It gates payload sizes, not machine-specific timing. These are local lab measurements, not field INP or complete page-lifetime CLS; the server/image cache remains warm and deployed telemetry is absent locally.

Artifacts are ignored under `output/playwright/`. `PERFORMANCE_OUTPUT=output/playwright/before-performance.json` retains a comparison baseline; use the same browser, machine and workload for comparisons. `PERFORMANCE_STRESS=1` selects the separate slower profile. Avoid simultaneous build/browser workloads during measurements. Deployed real-user performance requires separate [Speed Insights verification](operations.md#analytics-and-observability).

## Skills and content tooling

[`AGENTS.md`](../AGENTS.md) holds project rules; [`CLAUDE.md`](../CLAUDE.md) delegates to it. Project-local skills live in `.agents/skills/`:

| Skill/workflow                                          | Purpose, invocation and maintenance                                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`blog-to-pdf`](../.agents/skills/blog-to-pdf/SKILL.md) | `$blog-to-pdf` for static localized article downloads. Canonical commands, Chromium prerequisites, optional Python review and update procedure: [blog-pdfs.md](blog-pdfs.md). Scripts/template/manifest live in `scripts/blog-pdf/`                                                                |
| [`Humanizer`](../.agents/skills/humanizer/SKILL.md)     | `$humanizer` for explicitly requested future prose editing. Self-contained, no runtime dependencies. Exact pinned upstream revision, license, invocation and update procedure: [UPSTREAM.md](../.agents/skills/humanizer/UPSTREAM.md). Preserve vendored bytes; formatting exclusions protect them |
| DevImg                                                  | CLI workflow described in [devimg.md](devimg.md); compatible agent skills may be installed in a maintainer's environment, but no project-local DevImg skill is required                                                                                                                            |

Humanizer never runs in builds, PDF conversion or CI. PDF generation reuses source Markdown without editorial rewriting. Keep its complete guide canonical instead of duplicating installation/generation procedures here. Ignored drafts and task notes are not executable workflows or production dependencies.

## Common local failures

| Symptom                                       | Investigation and expected recovery                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unsupported Node or dependency mismatch       | Compare `node --version`, `.nvmrc`, `engines.node` and lockfile. Select the supported runtime and use `npm ci`; expect the declared tree to install. Do not mix package managers                       |
| Hook reports Gitleaks missing                 | Install the CI-pinned release of [Gitleaks](https://github.com/gitleaks/gitleaks#installing), put it on `PATH`, and rerun the staged check. Keep findings redacted; don't bypass the hook to get green |
| Missing Next route types                      | Run `npm run build` to generate `.next/types`, then rerun `npm run typecheck`. Next dev/build may rewrite `next-env.d.ts`; inspect generated-only diffs before handoff                                 |
| Connection refused / stale browser results    | Confirm the intended local port, successful build and running `npm run start`; set both test origins consistently. Avoid overlapping dev/build processes in one checkout                               |
| Browser executable missing                    | Install the matching Playwright Chromium or select existing Chrome; PDF freshness and unit checks can still run without it                                                                             |
| DevImg missing/stale export                   | Follow [DevImg prerequisites and checks](devimg.md#verification); inspect config/source/manifest differences before regeneration                                                                       |
| Blog PDF freshness failure                    | Follow [PDF troubleshooting](blog-pdfs.md#troubleshooting). The lockfile participates in the fingerprint, so dependency updates can require reviewed regeneration                                      |
| Formatting fails in unrelated/generated files | Inspect paths and existing exclusions, then format only owned changes. Preserve Humanizer's upstream bytes and generated/public artifacts                                                              |

## Maintenance checklist

- When package scripts, tools, hooks, runtime or CI change, review this guide and the README command list; keep `package.json`, `.nvmrc` and the lockfile authoritative.
- When directories or responsibilities change, update [architecture](architecture.md), README, imports, tests, config paths and applicable agent/skill references together.
- When content, assets or PDF inputs change, review [DevImg](devimg.md), [PDF instructions](blog-pdfs.md), published HTML/Markdown, locale mappings, downloads and public evidence contracts.
- When environment variables, domains, deployments or telemetry change, review [operations](operations.md), the source reads, workflow and public privacy notice as applicable. Date provider observations and qualify unverified dashboard settings.
- Before handoff, check documentation links, run applicable quality checks, inspect `git diff --check` and the full working tree, and exclude secrets, generated churn and unrelated changes. Record commands that failed or could not run.
