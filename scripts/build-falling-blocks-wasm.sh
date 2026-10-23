#!/usr/bin/env bash
# Build with the same compiler as CI; --check never overwrites the public binary.
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
crate_dir="$repo_root/wasm/falling-blocks"
artifact="$repo_root/public/games/falling-blocks/falling-blocks.wasm"
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
# Generic standard-library code can embed paths from a local rust-src install.
# Use the compiler's canonical source prefix so macOS and Linux emit equal bytes.
rust_source="$(rustc --print sysroot)/lib/rustlib/src/rust"
rust_commit="$(rustc --version --verbose | sed -n 's/^commit-hash: //p')"
cargo rustc --locked --release --target wasm32-unknown-unknown -- \
  --remap-path-prefix "$rust_source=/rustc/$rust_commit"
built="target/wasm32-unknown-unknown/release/falling_blocks.wasm"
if [[ "$mode" == "--check" ]]; then
  if ! cmp -s "$built" "$artifact"; then
    echo "The published WASM is stale. Run npm run games:wasm and commit the artifact." >&2
    exit 1
  fi
else
  mkdir -p "$(dirname "$artifact")"
  cp "$built" "$artifact"
fi
node "$repo_root/scripts/verify-falling-blocks-wasm.mjs"
