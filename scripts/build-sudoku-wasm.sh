#!/usr/bin/env bash
# Build with the CI compiler; --check compares without replacing the artifact.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
crate_dir="$repo_root/wasm/sudoku"
artifact="$repo_root/public/games/sudoku/sudoku.wasm"
mode="${1:-build}"
if [[ "$mode" != "build" && "$mode" != "--check" ]]; then
  echo "Usage: $0 [--check]" >&2
  exit 2
fi

if command -v rustup >/dev/null 2>&1 && rustup which cargo >/dev/null 2>&1; then
  toolchain_bin="$(dirname "$(rustup which cargo)")"
  export PATH="$toolchain_bin:$PATH"
fi
if [[ "$(rustc --version | cut -d ' ' -f 2)" != "1.98.1" ]]; then
  echo "Use Rust 1.98.1 (the CI compiler) to regenerate or check the WASM artifact." >&2
  exit 1
fi

cd "$crate_dir"
cargo test --locked --quiet
# Match canonical compiler source paths across macOS and Linux installations.
rust_source="$(rustc --print sysroot)/lib/rustlib/src/rust"
rust_commit="$(rustc --version --verbose | sed -n 's/^commit-hash: //p')"
cargo rustc --locked --release --target wasm32-unknown-unknown -- \
  --remap-path-prefix "$rust_source=/rustc/$rust_commit"
built="target/wasm32-unknown-unknown/release/sudoku.wasm"
if [[ "$mode" == "--check" ]]; then
  if ! cmp -s "$built" "$artifact"; then
    echo "The published Sudoku WASM is stale. Run bash scripts/build-sudoku-wasm.sh and commit the artifact." >&2
    exit 1
  fi
else
  mkdir -p "$(dirname "$artifact")"
  cp "$built" "$artifact"
fi
node "$repo_root/scripts/verify-sudoku-wasm.mjs"
