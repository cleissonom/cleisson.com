# Dev Image Pipeline

This site dogfoods `devimg` for static project cover variants, blog card/social images, and SEO Open Graph images. Project and blog images use JPEG generated sources with `next/image` marked `unoptimized` because DevImg already owns their sizing and quality. Inline blog charts can use SVG directly when translated chart text needs to stay crisp. SEO source PNGs are converted into smaller content-hashed JPEGs for metadata.

## Scope

- Project source: `public/projects`
- Project output: `public/images/generated/projects`
- Project manifest: `public/images/projects-manifest.json`
- SEO source: `public/seo`
- SEO output: `public/images/generated/seo`
- SEO manifest: `public/images/seo-manifest.json`
- Blog source: `public/images/blog`
- Blog output: `public/images/generated/blog`
- Blog manifest: `public/images/blog-manifest.json`
- Local reports: `.devimg/projects-report.md`, `.devimg/blog-report.md`, and `.devimg/seo-report.md`

The generated filenames are content-hashed through `content_hash_filenames = true`, so each generated URL changes when the encoded bytes change. This is the required precondition before applying broad immutable CDN caching to generated assets.

Project cover variants use `crop = "top"` so screenshot headers and top navigation remain visible in cropped cards and banners. Blog variants use a separate `devimg.blog.toml` config so article/card/social presets do not generate unrelated project outputs. SEO variants use a separate `devimg.seo.toml` config so project presets do not generate unrelated SEO outputs and SEO presets do not generate unrelated project outputs.

The CLI Tools and DevImg artwork use `[[overrides]]` entries with `fit = "contain"` so each full diagram is resized without cropping while the other project screenshots keep top-crop behavior.

AccessTrace keeps two narrow `quality:cover-crop` acknowledgements for the card and banner presets because the top-anchored crop was visually reviewed and is intentional. New unacknowledged warnings still fail strict checks.

`lib/devimg-projects.generated.ts` is generated from `public/images/projects-manifest.json`; `lib/devimg-blog.generated.ts` is generated from `public/images/blog-manifest.json`; `lib/devimg-seo.generated.ts` is generated from `public/images/seo-manifest.json`. They are the only places generated content-hash filenames are copied into app code. `lib/devimg.ts` derives project card, project banner, blog card, blog social, and SEO metadata variants from those generated modules.

## Verification

Prerequisites: run from the repository root with Bash and the DevImg CLI on `PATH`. Use the release pinned by [CI](../.github/workflows/ci.yml), currently [v0.2.7](https://github.com/cleissonom/devimg/releases/tag/v0.2.7), and verify the published checksum for your platform. DevImg is external development tooling; `npm ci` does not install it, and the deployed site does not run it.

```bash
devimg --version
npm run images:check
npm run images:check -- blog seo
```

[`scripts/check-images.sh`](../scripts/check-images.sh) is the shared implementation for strict variant checks and TypeScript export drift checks. With no arguments it checks `projects`, `blog` and `seo`; explicit names select pipelines. `DEVIMG_BIN` may select a specific binary, as CI does with the Action's resolved `binary-path`. The command stops on failure, rejects unknown pipeline names, and neither regenerates assets/exports nor writes reports.

Expected result: all variants and manifest exports are current, budgets pass, and no unacknowledged warnings remain. For missing/stale outputs, inspect the source/config/manifest difference before regenerating. Do not hand-edit generated paths or add broad warning acknowledgements to pass checks.

## Intentional regeneration

Prerequisites: reviewed source/config changes and a working DevImg installation. Choose exactly the affected pipeline; this example selects projects. The doctor and dry-run steps expose the proposed scope before writing outputs.

```bash
image_pipeline=projects # projects, blog, or seo
devimg doctor --config "devimg.${image_pipeline}.toml" --export-output "lib/devimg-${image_pipeline}.generated.ts" --export-format typescript --strip-prefix public --url-prefix /
devimg optimize --config "devimg.${image_pipeline}.toml" --dry-run
devimg optimize --config "devimg.${image_pipeline}.toml" --allow-overwrite
devimg manifest export --manifest "public/images/${image_pipeline}-manifest.json" --strip-prefix public --url-prefix / --format typescript --output "lib/devimg-${image_pipeline}.generated.ts"
npm run images:check -- "$image_pipeline"
devimg doctor --config "devimg.${image_pipeline}.toml" --export-output "lib/devimg-${image_pipeline}.generated.ts" --export-format typescript --strip-prefix public --url-prefix /
```

Use `--allow-overwrite` only for intentional regeneration. Expected result: changed image bytes get new content-hashed URLs, manifests/exports agree, and checks pass. If crop/composition changes, generate a review with `devimg review --manifest public/images/projects-manifest.json --output .devimg/projects-review.html`, adjusting the selected manifest, and visually inspect it before accepting outputs. Existing review files require an intentional `--force`; do not overwrite them blindly.

Doctor can warn about possible Next Image double optimization based on framework detection. Check the actual consumer in `lib/devimg.ts` and components; generated project/blog images already use `unoptimized`. Passing doctor an export path avoids its unchecked-helper warning. Quality warnings still require visual judgment, and existing narrow crop acknowledgements must be revisited when their source changes.

Commit/review generated variants, the selected manifest and matching `lib/devimg-*.generated.ts` together. `.devimg/` reports/reviews remain ignored. If a changed image is referenced by an article, follow [blog PDF freshness and regeneration](blog-pdfs.md) too. This organizational cleanup exercised verification only, not image regeneration or visual review.

## Optional AI previews

The [CI step](../.github/workflows/ci.yml) is the canonical example of fully flagged `devimg ai consent`, AI `review`, metadata-only `alt` and project-copy `draft` invocations. Consent/review/draft use `--dry-run`, `--ai-provider openai` and a placeholder model; artifacts go into the runner's temporary directory. `alt` is metadata-only by default. These invocations exercise artifact paths without API keys, image uploads or actual OpenAI calls, and draft prose is never published automatically.

For local preview, adapt those exact invocations to a fresh temporary output directory and retain `--dry-run`. Expected result: nonempty local artifacts, with no source or published-content edits. Inspect failures against `devimg <command> --help` for the installed version. The previews were not rerun as part of this documentation cleanup.

Real AI review/alt/draft requests are optional, require `OPENAI_API_KEY`, and only include image bytes with `--include-images`. They are separate, explicitly chosen content workflows; no live AI calls are part of ordinary generation checks or this site's runtime. Do not remove dry-run flags merely to investigate CI.

## CI and maintenance

The main workflow uses `cleissonom/devimg/action@v0.2.7` to download/checksum the CLI, strictly check project variants and their export, and prepare the project review. Its resolved binary then runs `bash scripts/check-images.sh blog seo`, prepares blog/SEO reviews, and checks AI preview artifacts. GitHub Actions uploads all three HTML reviews. CI never commits generated changes.

When updating DevImg, review the release and CLI help, update the Action pin deliberately, and verify the same configs/exports locally. Keep the package command, shared script, CI invocation and this guide synchronized. Review config/source/helper changes with the [image-pipeline skill](development.md#skills-and-content-tooling) when available; never hand-edit generated modules.
