# Deployment and operations

[README](../README.md) · [Architecture](architecture.md) · [Development](development.md)

## Evidence and service roles

Last inspection: **2026-09-07**. Treat observations as a dated snapshot, not desired configuration. Evidence labels:

- **R: repository**: directly verified in the linked source/configuration.
- **P: provider access**: read-only observations, labeled **public** (DNS/RDAP/HTTP) or **project** (Vercel settings or GitHub workflow metadata).
- **D: provider documentation**: supported platform behavior; not proof this project has enabled it.
- **U: unknown**: needs owner/dashboard confirmation. Missing repository configuration does not establish absence in a dashboard.

| Service/tool                        | Actual role and evidence                                                                                                                      | Required or optional                                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Cloudflare Registrar                | **P public:** registrar entity is Cloudflare, Inc., from [Verisign RDAP](https://rdap.verisign.com/com/v1/domain/cleisson.com)                | Current domain registration dependency; renewal/account settings unverified                                  |
| Cloudflare DNS                      | **P public:** authoritative nameservers are Cloudflare; website DNS answers and profile shortcut redirects observed below                     | Current DNS dependency; dashboard record/proxy/rule settings **U**                                           |
| Vercel hosting                      | **R:** CI prebuilt delivery and `vercel.json`. **P public:** website responses identify Vercel. **P project:** Next.js, root `.`, Node `24.x` | Current production hosting/delivery dependency                                                               |
| GitHub Actions                      | **R:** validation and production delivery in [ci.yml](../.github/workflows/ci.yml)                                                            | Current delivery workflow; inspected push passed validation/delivery (**P project**). Protection rules **U** |
| Vercel Web Analytics                | **R:** mounted SDK; **P public:** script endpoint available; dashboard enablement/received data **U**                                         | Included instrumentation; core site content works without it                                                 |
| Vercel Speed Insights               | **R:** mounted SDK; **P public:** script endpoint available; dashboard enablement/received data **U**                                         | Included performance instrumentation; core content works without it                                          |
| Build/runtime logs                  | **R:** CI has build steps. **D:** provider log capabilities. Actual retained project logs **U**                                               | Diagnostic capability; coverage and retention need verification                                              |
| DevImg / blog PDF tools / Humanizer | **R:** image checks, offline PDF workflows and optional editorial skill                                                                       | Development/CI tooling; see [development inventory](development.md#tool-inventory)                           |

Read-only `vercel project inspect cleisson.com --non-interactive --no-color` returned the project settings above with exit 0. The CLI displayed framework defaults for build/output/install, not a selected install command. It unexpectedly announced a login flow before returning project data; no login command, credentials, browser interaction, link or pull was supplied, and further authenticated probing stopped. No account identifiers or credential values are retained here. Cloudflare dashboard access was unavailable.

This inspection did not execute deployment, rollback, promotion, DNS changes, telemetry events or provider-setting changes. Recovery procedures below are documented from provider guidance and remain **unexercised** for this project.

## Domain, DNS and HTTP routing

[`lib/site.ts`](../lib/site.ts) declares `https://www.cleisson.com` as canonical (**R**). Registration and authoritative DNS happen to use Cloudflare here; they are separate roles, verified independently.

Public DNS/HTTP observations (**P public**, 2026-09-07):

| Name                    | DNS observation                                                                                                   | HTTP observation                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `cleisson.com`          | NS: `maya.ns.cloudflare.com`, `milan.ns.cloudflare.com`; A answer: `216.198.79.1`; no apex AAAA/CNAME/CAA answers | HTTP 308 to HTTPS apex; HTTPS apex 307 to `https://www.cleisson.com/` |
| `www.cleisson.com`      | CNAME: `f644512931f54b03.vercel-dns-017.com`; target resolved to IPv4; no AAAA answer                             | HTTPS 200, `server: Vercel`; HTTP 308 to HTTPS                        |
| `github.cleisson.com`   | Dashboard record and rule mechanism unverified                                                                    | Cloudflare response: 301 to `https://github.com/cleissonom/`          |
| `linkedin.cleisson.com` | Dashboard record and rule mechanism unverified                                                                    | Cloudflare response: 301 to `https://linkedin.com/in/cleissonom`      |

These are observed values, not records to copy during setup. An apex A answer does not identify whether the dashboard stores an A record or flattens a CNAME. The `www` CAA lookup followed the Vercel CNAME and returned certificate-authority policy at that target; it does not establish owner-created Cloudflare CAA records. Other subdomains and mail records were not audited.

```text
DNS lookup:       resolver -> Cloudflare authoritative DNS -> website DNS answer
Website HTTPS:    browser -> Vercel -> Next.js site
Profile shortcuts: browser -> Cloudflare redirect -> GitHub / LinkedIn
```

The diagram shows the observed public path. Apex/`www` answers and Vercel headers are consistent with DNS-only website routing; **the Cloudflare proxy toggles remain U**. Cloudflare is visible in the shortcut HTTP responses, but the implementing product (Redirect Rules, Page Rules, Worker, etc.) is unknown. Cloudflare documents that DNS-only records resolve to the target without proxying HTTP, while proxied records return Cloudflare addresses (**D**). [Proxy status](https://developers.cloudflare.com/dns/proxy-status/)

### Where behavior is controlled

| Behavior                             | Verified authority and remaining gap                                                                                                                                                                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Locale redirects/rewrites            | **R:** `proxy.ts`; independent of apex-to-`www` host redirects                                                                                                                                                                                                                  |
| Host redirects and domain assignment | **P public:** chains above; **U:** exact Vercel/Cloudflare dashboard rules and Vercel assigned-domain list                                                                                                                                                                      |
| TLS                                  | **P public:** observed HTTPS checks passed certificate verification; **U:** issuer/renewal workflow, Cloudflare zone SSL mode and origin settings. HSTS in `next.config.mjs` does not configure certificates                                                                    |
| Security headers                     | **R:** global headers in `next.config.mjs`, including HSTS with subdomains/preload directive; **P public:** HSTS observed. Browser preload enrollment is unverified                                                                                                             |
| Application caching                  | **R:** `next.config.mjs` owns static image/icon cache headers; generated image URLs are content-hashed. Markdown, MCP, REST evidence searches and API errors use `no-store`; successful REST profile/project responses and feeds have explicit shared caching in their handlers |
| Content negotiation                  | **R:** `proxy.ts` plus `vercel.json` append/preserve discovery and `Vary` headers. Do not strip these in provider transforms                                                                                                                                                    |
| Provider caching                     | **P public:** `x-vercel-cache: HIT` on an inspected website response; **U:** dashboard cache rules/overrides. No Cloudflare website HTTP cache coverage is established                                                                                                          |
| Verification/certificates            | **D:** Vercel Domains shows project-specific routing/verification requirements and certificate status. **U:** outstanding verifications, owner-managed validation records and renewal dependencies                                                                              |

Use the values shown for this project in Vercel Settings → Domains when comparing DNS, not generic provider examples. Changing DNS, proxying or TLS requires a separately reviewed action. [Domain configuration](https://vercel.com/docs/domains/working-with-domains/add-a-domain), [Vercel SSL certificates](https://vercel.com/docs/domains/working-with-ssl)

### DNS, redirect, certificate and cache troubleshooting

Prerequisites: `dig`, `curl`, the affected hostname/URL and time; read access to provider settings if public evidence is insufficient. This sequence diagnoses without changing infrastructure.

1. Resolve DNS with the commands below. Compare the current delegation with authoritative answers and a second resolver. Expected: nameservers answer and website targets agree with the project's Vercel Domains instructions. NXDOMAIN, SERVFAIL, mismatched delegation or stale recursive answers narrow the failure before HTTP. If DNSSEC validation is implicated, have the owner compare registrar DS and authoritative signing status; neither was audited here.
2. Follow redirects with a bounded `curl` chain. Expected: apex reaches canonical HTTPS `www`, and shortcut hosts reach their profile destinations. For loops, record each status/location and compare host rules in Vercel/Cloudflare with application locale routing. Do not toggle proxy/TLS settings as an experiment.
3. Keep certificate verification enabled. For handshake or hostname failures, inspect the presented hostname, Vercel domain/certificate state, current DNS/CAA and any pending validation. If a host is confirmed proxied, also inspect its Cloudflare certificate and origin TLS configuration. An HSTS header is not certificate-health evidence.
4. For stale content, first match the active production deployment to its Git commit, then compare the URL and cache headers. Inspect `Cache-Control`, `Age`, `x-vercel-cache`, and Cloudflare cache headers only where present. Hashed image changes should produce new URLs; stable images/icons have different policies in `next.config.mjs`. Test with browser cache disabled before proposing a scoped purge. No cache purge was exercised.

```bash
dig +short NS cleisson.com
dig +noall +answer cleisson.com A
dig +noall +answer cleisson.com AAAA
dig +noall +answer www.cleisson.com CNAME
dig +noall +answer www.cleisson.com CAA
dig @maya.ns.cloudflare.com cleisson.com A +noall +answer
curl --head --location --max-redirs 5 --max-time 20 https://cleisson.com/
```

The explicit nameserver is from the dated observation; use the current delegation if it changes. If public checks fail from only one network, compare another resolver/network before concluding the origin is down. Preserve redacted evidence rather than account exports in repository issues.

## Vercel delivery and environments

### Repository-controlled lifecycle

The [workflow](../.github/workflows/ci.yml) is authoritative (**R**):

1. Pull requests and pushes to `main` run `validate` on Ubuntu with the GitHub environment named `Production`.
2. Validation checks Git history with Gitleaks; verifies DevImg variants/exports and AI dry-run artifacts; installs Node from `.nvmrc` and dependencies with `npm ci`; runs lint, core tests, PDF freshness, typecheck and a production build.
3. Only a push to `main` can run `deploy`, and it depends on successful validation. It uses the same GitHub environment, with a `vercel-production` concurrency group that cancels an in-progress delivery when superseded.
4. Delivery installs dependencies, runs `vercel@latest pull` for production settings, `vercel@latest build --prod`, and `vercel@latest deploy --prebuilt --prod`, authenticated by GitHub secrets. These are descriptions of existing CI steps, not commands executed during this documentation work.
5. Vercel receives the built output; the domain's actual active deployment must be checked afterward. The earlier validation build and the Vercel artifact build are separate steps. GitHub's environment name does not prove dashboard protection rules exist.

The [inspected push run for `cea31eb`](https://github.com/cleissonom/cleisson.com/actions/runs/34157075196) reported successful `Validate Code` and `Deploy to Vercel` jobs on the inspection date (**P project**, workflow metadata only). Correlation with the deployment currently serving the canonical domain remains unverified.

Vercel documents that `build` produces `.vercel/output` and `deploy --prebuilt` uploads that output without another remote build (**D**). [Vercel with GitHub Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel)

[`vercel.json`](../vercel.json) sets `git.deploymentEnabled.main=false` (**R**), avoiding automatic Vercel Git deployments from `main` alongside CI delivery. Unspecified branches are permitted by this configuration under Vercel's documented semantics (**D**), but **the Git connection and actual preview triggers are U**. There is no preview-deploy job in this workflow. [Git configuration](https://vercel.com/docs/project-configuration/git-configuration)

### Environment and build settings

| Area                   | Verified configuration                                                                                                                                                 | Owner verification                                                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local                  | **R:** `npm run dev`; production simulation uses `npm run build`/`npm run start`                                                                                       | Vercel account access is unnecessary for these commands                                                                                                  |
| Preview                | **R:** no CI preview job; non-main Git branches not disabled in `vercel.json`                                                                                          | **U:** connected repository, event/branch rules, deployment protection, branch-specific variables and actual preview delivery                            |
| Production             | **R:** CI push branch is `main`, CLI uses production scope                                                                                                             | **U:** dashboard production branch, protection/approval rules, active domain assignment and current deployment commit                                    |
| Framework/root/runtime | **P project:** Next.js preset, root `.`, Node `24.x`. **R:** `.nvmrc` is the CI baseline; `package.json` constrains Node                                               | Confirm drift and settings effective for a particular deployment                                                                                         |
| Install/build/output   | **R:** CI `npm ci`; package build is `next build`; Vercel artifacts come from `vercel build`. **P project:** CLI displayed framework defaults for build/install/output | Exact resolved install command and any deployment-level overrides are not verified; no custom static export/output directory is set in repository config |
| Domains                | **R/P public:** canonical `www`, apex redirect and DNS targets above                                                                                                   | **U:** assigned domains, redirect configuration, verification status and certificate state                                                               |

### Environment variables

Only names and purposes belong in this reference. No custom application credential is required by the inspected code. Dashboard variable names/scopes and secret presence were not enumerated.

| Name                                                               | Purpose/source                                                                                | Scope and management                                                                                                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`                                                     | Workflow secret authenticating Vercel CLI                                                     | Required for CI production delivery; GitHub Actions secret. Effective repository/organization/environment source and validity **U**                                                   |
| `VERCEL_USER_ID` → `VERCEL_ORG_ID`                                 | Workflow maps this secret into Vercel's organization identifier variable                      | Required by current delivery configuration. The legacy secret name does not prove a personal-account deployment                                                                       |
| `VERCEL_PROJECT_ID`                                                | Workflow secret exported for project targeting                                                | Required for CI production delivery; GitHub Actions secret                                                                                                                            |
| `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL` | `app/api/mcp/route.ts` extends MCP host/origin allowance                                      | Vercel system variables for deployed environments where available; optional for local/canonical hosts, relevant to preview aliases. Actual injection through this prebuilt flow **U** |
| `NODE_ENV`                                                         | Next runtime mode; `proxy.ts` uses it for the secure locale cookie; SDKs use environment mode | Framework-managed for local dev/production builds; do not use it as proof of Vercel environment assignment                                                                            |
| `ANALYZE`                                                          | `next.config.mjs` enables bundle analyzer                                                     | Optional local diagnostic build; set by `npm run analyze`                                                                                                                             |
| `BROWSER_BASE_URL`                                                 | Browser/performance test origin                                                               | Local verification, defaults in `playwright.config.mjs` and `tests/browser/performance.mjs`                                                                                           |
| `AGENT_READINESS_BASE_URL`                                         | Overrides HTTP endpoint test server                                                           | Local production verification; full suite is unsuitable for a live smoke check                                                                                                        |
| `PLAYWRIGHT_CHANNEL`                                               | Selects browser for tests and PDF generation                                                  | Optional local tooling; defaults to Chromium                                                                                                                                          |
| `PERFORMANCE_OUTPUT`, `PERFORMANCE_STRESS`                         | Performance artifact path and slower emulation profile                                        | Optional local measurement tooling                                                                                                                                                    |
| `DEVIMG_BIN`                                                       | Shared image checker and CI follow-up commands select DevImg                                  | Optional locally; CI uses the Action's resolved `binary-path`                                                                                                                         |
| `OPENAI_API_KEY`                                                   | Optional real DevImg AI requests                                                              | External CLI session only; not required by application, CI dry-runs or ordinary image checks                                                                                          |
| `NEXT_TELEMETRY_DISABLED`                                          | HTTP test harness suppresses Next CLI telemetry                                               | Test child-process environment; separate from website visitor analytics                                                                                                               |
| `GH_TOKEN`, `GITLEAKS_VERSION`                                     | CI obtains the pinned Gitleaks release using GitHub's workflow token                          | CI step-local; not application configuration                                                                                                                                          |

Vercel documents system-variable availability and automatic exposure settings; confirm the deployed MCP aliases against the actual system-variable availability, especially with prebuilt output (**D/U**). [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)

For a missing/wrong variable, inspect the failing workflow step or runtime behavior first, then compare the **name and scope** against the table and provider settings. Do not print values or run `env pull` to diagnose a name mismatch. If configuration needs correction, obtain authorization and follow it with a new validated deployment; an existing build is not evidence that changed settings took effect.

### Post-deployment smoke checks

Prerequisites: an already authorized deployment, its expected Git commit, `curl`, and access to the target URL. These are GET/HEAD checks; they do not deploy or send analytics events. Domain redirects and script HEAD checks were exercised in the dated inspection; the complete post-deployment procedure has not been exercised against a newly deployed change.

1. In GitHub Actions, confirm the intended `validate` and `deploy` jobs completed; in Vercel, match the active production deployment to that commit. For a protected preview, use authorized dashboard/browser access without changing protection or putting bypass secrets in shell examples.
2. Check the apex redirect chain, then each locale's home, projects, blog, resume and MCP documentation page. Expected: correct locale, substantive server-rendered HTML and canonical metadata.
3. Compare HTML, negotiated Markdown and `.md` responses. Expected: correct content types, equivalent substantive content, discovery `Link` headers and `Vary: Accept` on deployed negotiable pages; Markdown is `no-store`. Local Next.js cannot prove the Vercel transform.
4. Check feeds, sitemap, `llms.txt`, OpenAPI, a REST profile response and PDF downloads. Expected: successful responses with the documented media types. A 401 on a protected preview is an access/protection question, not evidence of an application outage.
5. Use the analytics verification below separately if validating data delivery is authorized; a successful script fetch alone proves only resource availability.

```bash
site_origin=https://www.cleisson.com
curl --fail --silent --show-error --head --location --max-redirs 5 --max-time 20 https://cleisson.com/
curl --fail --silent --show-error --max-time 20 -D - -H 'Accept: text/html' "$site_origin/en-US"
curl --fail --silent --show-error --max-time 20 -D - -H 'Accept: text/markdown' "$site_origin/en-US"
curl --fail --silent --show-error --max-time 20 -D - "$site_origin/en-US.md"
curl --fail --silent --show-error --max-time 20 "$site_origin/api/v1/profile?locale=en-US"
curl --fail --silent --show-error --head --max-time 20 "$site_origin/downloads/resume.en-US.pdf"
```

Repeat relevant paths for `pt-BR` and `es-ES`; use the current blog `pdfUrl` mappings from the [PDF guide](blog-pdfs.md). Investigate wrong content type or cache variance before treating a 200 alone as success. Do not aim the full endpoint/MCP regression suites at production: they send telemetry-test, oversized and rate-limit requests.

### Recovery procedure (unexercised)

Prerequisites: explicit incident/deployment authority, dashboard access, an eligible known-good production deployment, and its commit/configuration evidence. Check plan eligibility in the dashboard; the project's plan and available candidates are unknown.

1. Record affected routes, current commit and redacted error evidence. Compare the previous deployment before choosing recovery; a DNS or provider outage may not be fixed by reverting application code.
2. In the Vercel project, open Instant Rollback, select an eligible previous production deployment, and review affected domains and its original environment configuration. Confirm only after authorization. Expected: domains serve the selected previous build.
3. Repeat the smoke checks. Rollback reuses old build/configuration; it does not refresh environment variables or fix external systems. If no eligible deployment exists or the action fails, prepare a reviewed revert/fix through the normal validated delivery workflow.
4. Vercel disables production-domain auto-assignment after rollback. Once a fix is validated, use the documented Undo Rollback/promotion flow with authorization and verify domain assignment again before declaring delivery restored.

These steps follow current [Instant Rollback documentation](https://vercel.com/docs/instant-rollback) (**D**); no rollback, promotion or workflow rerun was performed. Avoid blindly rerunning a workflow that includes the production deploy job.

## Analytics and observability

`<Analytics />` and `<SpeedInsights />` are mounted with default props in [`app/[locale]/layout.tsx`](../app/[locale]/layout.tsx) and [`app/(default)/layout.tsx`](<../app/(default)/layout.tsx>) (**R**). `/_vercel` bypasses locale/content routing. Both production script URLs answered HEAD with 200 and a JavaScript content type (**P public**). No custom analytics event calls were found in the application.

| Capability / question                                                  | Evidence, data location and environments                                                                                                                              | Limitations and non-disruptive verification                                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitor analytics: which pages get visits, from where?                 | Mounted Web Analytics SDK (**R**); Vercel project Analytics view (**D**). Same layouts are included in deployed builds; actual Preview/Production data coverage **U** | Requires browser execution and successful collection; blockers and JavaScript-disabled clients limit coverage. Script availability is verified; inspect recent existing dashboard data with the correct environment/time filter to verify receipt       |
| Real-user performance: which routes/devices have poor page experience? | Mounted Speed Insights SDK (**R**); Vercel project Speed Insights view (**D**). Actual environment coverage/sample volume **U**                                       | Field samples differ from local lab tests and need sufficient traffic. Inspect existing recent metrics by route/environment; absence of samples does not by itself prove a broken SDK                                                                   |
| Build failures: which install/check/compile step failed?               | GitHub Actions job/step output is first evidence for this prebuilt workflow (**R**); Vercel deployment details/log views are provider capabilities (**D**)            | No remote logs inspected. Build logs describe a particular build, not visitor errors. Verify by opening an existing run and correlating the commit, never by intentionally breaking production                                                          |
| Server/routing failures: did a request fail at runtime?                | Vercel project Logs for Function/Routing Middleware activity (**D**); Preview/Production log access and actual retained data **U**                                    | Static requests are not a complete runtime-log stream. Inspect an existing request around the reported time/deployment. `lib/public-api.ts` catches errors into problem responses without logging their cause, so root-cause diagnostics may be missing |
| Browser/application error reports, tracing, alerts                     | No dedicated error reporter, OpenTelemetry instrumentation, log drain or alert configuration found in repo (**R**); external/dashboard integrations **U**             | Browser console/reproduction and available server logs are current evidence. Neither visitor analytics nor Speed Insights establishes comprehensive exception reporting or incident detection                                                           |
| Cloudflare traffic/security insights                                   | DNS and shortcut delivery observed; dashboard analytics/access **U**                                                                                                  | Do not claim website request/error coverage from authoritative DNS alone or from the shortcut redirects                                                                                                                                                 |

Dashboard enablement, mounted instrumentation and received data are separate checks. Provider setup references (**D**): [Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart), [SDK mode/configuration](https://vercel.com/docs/analytics/package), [Speed Insights quickstart](https://vercel.com/docs/speed-insights/quickstart), [Speed Insights dashboard](https://vercel.com/docs/speed-insights/using-speed-insights).

For a receipt check, prefer existing dashboard traffic. If a controlled ordinary browser visit is authorized, use the intended deployment, observe script/collection requests in the Network panel, and then correlate the visit/metric in the correctly filtered dashboard after its processing delay. Never fabricate events or submit a load test. Development SDK debug output, a 200 script response, and a 2xx collection response each establish less than seeing data in the dashboard. This end-to-end receipt check was not exercised.

Retention, selected plans, sampling/usage limits, add-ons and costs are **U** for this project. Confirm them in the account before relying on history or enabling anything. Provider limits change; keep [runtime log retention](https://vercel.com/docs/logs/runtime) and [log capabilities](https://vercel.com/docs/logs) as references instead of copying plan-specific numbers here. Runtime logs, build logs, visitor analytics and field performance answer different questions.

### Privacy reference

The public notices at `/en-US/privacy`, `/pt-BR/privacy` and `/es-ES/privacy` are sourced from [`data/i18n/`](../data/i18n/). They disclose locale/theme cookies, Vercel analytics/performance, possible hosting/security request processing and public REST/MCP argument handling. The mounted SDKs and application cookie behavior are verified; actual provider payloads and retention were not inspected. The notice's statement that analytics is enabled is not independent proof of received data. Refer to [Vercel Analytics privacy](https://vercel.com/docs/analytics/privacy-policy) for the provider's description; this operational reference makes no legal-compliance claim.

## Incident triage

Prerequisites: affected URL/locale, approximate time, expected versus observed behavior, and deployment commit if available. Use read-only access; keep credentials, request bodies and personal data out of shared logs/screenshots. Recovery and configuration changes require incident authority.

| Situation             | Inspect first, then narrow                                                                                                                                                                 | Expected result and remaining blind spot                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failed deployment     | GitHub Actions failing step and commit; distinguish validation failure, Vercel settings pull/auth failure, artifact build and upload                                                       | Identify the first actionable error. Reproduce safe local checks; verify secret names/scopes privately for auth failures. Do not rerun production delivery without authorization |
| Site unavailable      | DNS resolution → TLS/redirect chain → current Vercel domain/deployment; compare [Cloudflare status](https://www.cloudflarestatus.com/) and [Vercel status](https://www.vercel-status.com/) | Locate DNS, transport, routing or application failure. Dashboards/log access and external uptime alert coverage remain unverified                                                |
| Broken functionality  | Exact locale/route, raw HTML/Markdown or API response, browser console/network, then Vercel runtime logs if available                                                                      | Reproduce against the same commit locally with focused tests. REST errors may omit internal causes; no dedicated client exception stream is established                          |
| Preview-only failure  | Preview protection, commit/build settings, variable scopes and MCP host/origin allowance                                                                                                   | Separate access control or alias-specific configuration from code regressions. Do not disable protection or broaden trusted origins as a diagnostic shortcut                     |
| Production regression | Active domain's deployment commit versus expected CI run; compare last known good artifact                                                                                                 | Decide between a reviewed fix/revert and authorized rollback. An uploaded deployment may differ from the one currently assigned to production                                    |
| Degraded performance  | Speed Insights by route/device/environment if data exists; browser network and payloads; local performance harness; runtime logs for slow dynamic handlers                                 | Separate client payload/third-party/network costs from server latency. Lab output is not field INP; trace/alert coverage and field sample volume are unverified                  |

After recovery, rerun the focused smoke checks, confirm the active commit/domain and capture the root cause plus remaining gaps. Update this reference when a previously unknown setting is verified.

## Owner verification checklist

- Cloudflare: actual apex record type/target, website proxy toggles, profile redirect mechanism, TLS/certificate mode, DNSSEC/validation dependencies, caching/rules and domain renewal responsibility.
- Vercel: connected Git repository, dashboard production branch, preview event rules/protection, resolved install/build/output settings, assigned domains/redirects/certificate state and current production-domain auto-assignment.
- GitHub/Vercel: effective CI secret names/scopes and presence, protected environment/branch rules, system-variable availability for deployed MCP aliases, the commit serving the active domain. Keep all values private.
- Analytics/operations: feature enablement, recent received data and environments, plan/retention/usage limits, log access and coverage, external error reporting/tracing/log drains, alerts and incident notifications.
- Recovery: eligible rollback deployment, authorized operator and confirmation that normal domain assignment can be restored. No recovery exercise has been performed.

Potential follow-ups, separate from this cleanup: decide whether to pin the CI Vercel CLI, standardize on Husky or the optional Python pre-commit setup, and add error/alert coverage only after confirming existing provider capabilities and a concrete operational need. No services, tracking, paid features or alerts were added.
