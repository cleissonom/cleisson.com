# Humanizer installation for cleisson.com

- Upstream: [blader/humanizer](https://github.com/blader/humanizer)
- Installed commit: [`9862685f575c65a8247f90369951df1b3416e3d6`](https://github.com/blader/humanizer/tree/9862685f575c65a8247f90369951df1b3416e3d6)
- Skill version: `3.0.0`
- License: [MIT](LICENSE), copyright 2025 Siqi Chen
- Location: `.agents/skills/humanizer/`

`SKILL.md`, `README.md`, `LICENSE`, and `agents/openai.yaml` are exact upstream copies. The skill is self-contained and needs no scripts or runtime dependencies. Upstream development instructions, CI, package validation script, and Claude plugin manifests are omitted from this Codex installation. No compatibility changes were made to the skill or its UI metadata. This file records project usage and provenance separately from upstream instructions.

## Use in this repository

Invoke it in Codex for a future editorial task, for example:

```text
$humanizer Edit the prose in content/blog/en-US/my-new-post.md.
Preserve all facts, citations, code, frontmatter, and link targets.
```

Limit edits to the requested prose and review the diff for factual fidelity. Do not run Humanizer during PDF conversion or as a build hook. PDF generation must reproduce the Markdown without editorial changes.

Codex [discovers repository skills from `.agents/skills`](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills). The installed skill is available on the next turn; restart Codex if it does not appear. No user-level settings or installation are needed. The unchanged upstream README also describes installation for other agents; use this project's local procedure when updating this copy.

## Update or reinstall

Use upstream's documented manual installation method. Review the new upstream README, skill, license, and any supporting files before replacing the installed version.

1. Resolve and record the desired exact revision:

   ```bash
   git ls-remote https://github.com/blader/humanizer.git refs/heads/main
   ```

2. Set `humanizer_ref` to that reviewed commit. These commands reproduce the currently installed release in a temporary directory:

   ```bash
   humanizer_ref=9862685f575c65a8247f90369951df1b3416e3d6
   humanizer_tmp=$(mktemp -d)
   curl --fail --location "https://github.com/blader/humanizer/archive/$humanizer_ref.tar.gz" --output "$humanizer_tmp/source.tar.gz"
   tar -xzf "$humanizer_tmp/source.tar.gz" -C "$humanizer_tmp"
   humanizer_source="$humanizer_tmp/humanizer-$humanizer_ref"
   python3 "$humanizer_source/scripts/validate-package.py"
   ```

3. Inspect the extracted files and any newly referenced resources. Preserve the upstream bytes when copying the required files, and retain this project note:

   ```bash
   for humanizer_file in SKILL.md README.md LICENSE agents/openai.yaml; do
     cp "$humanizer_source/$humanizer_file" ".agents/skills/humanizer/$humanizer_file"
   done
   ```

4. Update this file's commit, version, file list, and hashes. Keep the license and attribution. Never copy `.git`, create links outside this project, or install globally. Remove the temporary directory after review.
5. Parse `SKILL.md` frontmatter and `agents/openai.yaml`, check all skill references, and confirm `$humanizer` appears in Codex from this repository. Review the change independently of article edits.

## Verification of this installation

The pinned upstream package passed its own `python3 scripts/validate-package.py` before the development-only files were omitted. The repository's existing `gray-matter` and `js-yaml` parsers accepted the installed metadata. Codex's local app-server `skills/list` request with this repository as `cwd` and `forceReload: true` returned one enabled `humanizer` skill with `scope: repo`, the expected UI metadata, and no errors.

All four files were compared byte-for-byte with the pinned upstream. SHA-256 values:

| File                 | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `SKILL.md`           | `e8269e236bed06ed0fe4824c274112e54950b0cb46b0bafe5e1576ef7c9f93d5` |
| `README.md`          | `d546538831ce8423587208d4a86dbe2be1f1f63445505d284dc558e6de86dac0` |
| `LICENSE`            | `4ac4810254ab36d45419141aeb8e69bf50652cfafe5b2dab947d06d44e5cbf96` |
| `agents/openai.yaml` | `9d87ff83149a04f86a372948b8ee35fa249de20923867bbc2a49304290aad736` |
