# cleisson.com

Personal website and professional portfolio for Cleisson de Oliveira Moura at [www.cleisson.com](https://www.cleisson.com). Built with Next.js App Router, React, and TypeScript, with English, Portuguese, and Spanish content.

Pages serve semantic HTML and equivalent Markdown. The site also publishes localized resumes, blog PDFs, feeds, structured data, and a read-only REST API and MCP server backed by the same professional evidence.

## Quick start

Use the Node version in [`.nvmrc`](.nvmrc), within the range in [`package.json`](package.json), and npm with the committed lockfile.

```bash
nvm use
npm ci
npm run dev
```

Open <http://localhost:3000>. If you do not use nvm, select the matching Node version with your existing version manager. No application credentials or environment file are required for local development. Installation sets up the Husky hook; committing also requires Gitleaks on `PATH`.

## Essential commands

Run from the repository root. [`package.json`](package.json) is the complete command reference.

| Command                                             | Purpose                                                                          |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`                                       | Local Next.js development server                                                 |
| `npm test`                                          | Content and agent-readiness tests; HTTP suites start local servers               |
| `npm run lint`                                      | ESLint, with zero warnings allowed                                               |
| `npm run typecheck`                                 | TypeScript checks                                                                |
| `npm run format:check`                              | Prettier check                                                                   |
| `npm run build` / `npm run start`                   | Build and serve production locally                                               |
| `npm run images:check`                              | Verify existing DevImg variants and exports; requires DevImg                     |
| `npm run blog:pdf:check`                            | Verify blog PDF freshness without generation or a browser                        |
| `npm run test:browser` / `npm run test:performance` | Browser regressions / payload measurements; requires a running production server |

See [development and tooling](docs/development.md) for prerequisites, focused commands, hooks, troubleshooting, and maintenance procedures.

## Structure and documentation

```text
app/                 Framework routes, layouts, metadata, feeds, APIs, styles
components/          Shared UI and design-system primitives
content/             Published Markdown by content type and locale
data/                Localized dictionaries, profile, recommendations, slug indexes
lib/                 Content, routing, metadata, evidence, API and MCP logic
public/              Public contracts, source/generated assets, stable downloads
tests/               Content, PDF, agent-readiness, browser and performance checks
scripts/             Maintainer tooling and PDF generation, shared with CI
.agents/skills/      Project-local blog-to-PDF and vendored Humanizer skills
docs/                Maintainer documentation
proxy.ts             Locale routing, content negotiation and discovery headers
```

- [Architecture and content](docs/architecture.md): responsibilities, authoring, localization, public interfaces.
- [Development and tooling](docs/development.md): setup, checks, scripts, skills, maintenance checklist.
- [Deployment and operations](docs/operations.md): Cloudflare/domain evidence, Vercel delivery, environments, analytics, troubleshooting and recovery.
- [DevImg](docs/devimg.md): source assets, generated outputs, verification and regeneration.
- [Blog PDFs and writing skills](docs/blog-pdfs.md): PDF generation/review and Humanizer invocation/update references.
- [Design system](components/design-system/README.md): UI foundations and interaction contracts.

Production delivery is defined in [GitHub Actions](.github/workflows/ci.yml): validated pushes to `main` use Vercel prebuilt deployments. [`vercel.json`](vercel.json) disables Vercel Git deployments for `main`. Provider settings and observations are qualified in the operations guide; deployment and recovery procedures require separate authorization to execute.
