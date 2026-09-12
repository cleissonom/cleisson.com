# Humanizer provenance and client variants

- Upstream: [blader/humanizer](https://github.com/blader/humanizer)
- Source commit: [`9862685f575c65a8247f90369951df1b3416e3d6`](https://github.com/blader/humanizer/tree/9862685f575c65a8247f90369951df1b3416e3d6)
- Source version: `3.0.0`
- License: [MIT](LICENSE), copyright 2025 Siqi Chen
- Original source snapshot: [`.agents/upstream/humanizer/`](../../upstream/humanizer/)
- Active variants: [Codex](../../codex/skills/humanizer/SKILL.md) and
  [Antigravity](../../antigravity/skills/humanizer/SKILL.md)

The four upstream files remain byte-for-byte intact in the source snapshot,
which is outside skill discovery. The old `SKILL.md` location is a neutral router
that selects instructions using the actual host application. Each active variant
has an independent MIT license and concise style reference; Codex also retains
upstream UI metadata. The snapshot is provenance, not an additional instruction
file to load during editing.

The user requested these client-specific adaptations. Codex guidance states the
outcome and factual boundaries; Antigravity adds an explicit editing workflow and
output branches. Both retain all 25 pattern categories, fact/voice preservation,
and file-mode protection of code, metadata, and link targets. Pasted-text output
now defaults to the finished rewrite; intermediate drafts are included on request.

Humanizer remains independent editorial tooling. It never runs during PDF
conversion, tests, or builds and introduces no website runtime dependency. PDF
conversion preserves Markdown prose exactly.

## Updating

Review an exact upstream revision and its resources/license before changing the
snapshot. Preserve original bytes under `.agents/upstream/humanizer/`, then review
both adaptations against that source. Do not overwrite the discovery router with
upstream instructions or copy plugin manifests, `.git`, or unrelated development
files. Update this note and the hashes when the source revision changes.

Keep both client catalogs aligned. Validate the two `SKILL.md` files and their
references, preserve factual/file-mode boundaries, and review editorial changes
independently of article edits. Select by host application, not model name.

## Original source hashes

| File                 | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `SKILL.md`           | `e8269e236bed06ed0fe4824c274112e54950b0cb46b0bafe5e1576ef7c9f93d5` |
| `README.md`          | `d546538831ce8423587208d4a86dbe2be1f1f63445505d284dc558e6de86dac0` |
| `LICENSE`            | `4ac4810254ab36d45419141aeb8e69bf50652cfafe5b2dab947d06d44e5cbf96` |
| `agents/openai.yaml` | `9d87ff83149a04f86a372948b8ee35fa249de20923867bbc2a49304290aad736` |
