#!/usr/bin/env bash
set -euo pipefail

devimg_bin="${DEVIMG_BIN:-devimg}"
if ! command -v "$devimg_bin" >/dev/null 2>&1; then
  printf 'DevImg is unavailable. See docs/devimg.md for prerequisites.\n' >&2
  exit 127
fi

if [ "$#" -eq 0 ]; then
  set -- projects blog seo
fi

for pipeline in "$@"; do
  case "$pipeline" in
    projects|blog|seo) ;;
    *) printf 'Unknown image pipeline: %s (use projects, blog, or seo).\n' "$pipeline" >&2; exit 2 ;;
  esac
done

for pipeline in "$@"; do
  "$devimg_bin" check --config "devimg.${pipeline}.toml" --fail-on-warning --no-report
  "$devimg_bin" manifest export \
    --manifest "public/images/${pipeline}-manifest.json" \
    --strip-prefix public \
    --url-prefix / \
    --format typescript \
    --output "lib/devimg-${pipeline}.generated.ts" \
    --check
done
