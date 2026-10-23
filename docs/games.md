# Browser games

[Development](development.md) · [Architecture](architecture.md)

The games index and `/games/falling-blocks` are published under `en-US`, `pt-BR`, and `es-ES`. Their HTML and Markdown share localized descriptions, rules, keyboard controls, and accessibility limitations. Gameplay requires JavaScript, WebAssembly, and a 2D canvas. The visual board does not have a screen-reader equivalent.

Falling Blocks uses a 12×12 board and six shapes containing one to five cells. Only complete horizontal rows disappear. The rows above move down intact, preserving their holes and cell order. Each clear awards `90 × cleared rows × level`; the level increases every six rows. The renderer uses a uniform green grid with beveled square tiles; each of the six shapes keeps its own bright color on the board and in the previews. A translucent shadow shows where the active piece will land. The game has no audio, account, leaderboard, or persistent game storage. Existing site analytics remain governed by the site's privacy notice.

## Implementation and verification

- `wasm/falling-blocks/`: dependency-free Rust rules, state machine, and WASM ABI. `src/lib.rs` documents memory regions and exports.
- `lib/falling-blocks/`: TypeScript ABI reader and canvas renderer.
- `components/games/`: client lifecycle, controls, and server-rendered rules.
- `data/games.ts` and localized dictionaries: published slug and copy. Games are separate from the professional project/evidence registry.
- `public/games/falling-blocks/falling-blocks.wasm`: committed artifact served by Next.js. Ordinary npm builds do not need Rust.

Use Rust **1.98.1**, matching the build script and CI, with the `wasm32-unknown-unknown` target. No Cargo packages need downloading. If necessary, install the compiler with `rustup toolchain install 1.98.1 --profile minimal --target wasm32-unknown-unknown`, then select it for the build with `RUSTUP_TOOLCHAIN=1.98.1`.

```bash
npm run games:wasm
npm run games:wasm:check
cargo fmt --manifest-path wasm/falling-blocks/Cargo.toml -- --check
cargo clippy --manifest-path wasm/falling-blocks/Cargo.toml --all-targets -- -D warnings
npm test
```

`games:wasm` runs native tests, builds the binary, and verifies its ABI in Node. The build normalizes local Rust source paths to the compiler's canonical prefix so installed source locations do not change the artifact. `games:wasm:check` rebuilds and compares bytes without replacing the published artifact; CI runs it to catch stale binaries. Rebuild after changing Rust code, including line changes that can affect embedded panic locations.

Browser checks cover completing a row through normal keyboard play, preserving incomplete rows and holes, keyboard focus, touch controls at 320px, pause/resume/restart, failed loading and retry, loading-disabled controls, and all locales without JavaScript. The clearing test fixes the random seed and clock so the same placements exercise the real engine every time, then checks the visible line count and settled canvas. Run the existing production-browser workflow in [development.md](development.md), then:

```bash
BROWSER_BASE_URL=http://localhost:3123 npm run test:browser -- tests/browser/games.spec.mjs tests/browser/game-clearing.spec.mjs
```

For development, use `http://localhost:3123` with `npm run dev -- --port 3123`. Next.js development origin checks can reject JavaScript requests when a server started with the default hostname is accessed through `127.0.0.1`; the production browser workflow avoids that development-only restriction.

## Publication and asset provenance

The engine adapts the prototype supplied by the owner as their own creation. An adjacent standalone JavaScript prototype was also inspected; it has no runtime dependencies or separate license file. No external game code was downloaded for this change. This review records the supplied provenance and does not independently establish copyright ownership.

The canvas graphics added here are drawn by repository code. No external artwork, fonts, music, recordings, logos, or game assets were added. Site fonts and other existing site assets retain their existing provenance. “Falling Blocks” is used as a descriptive title; this work does not represent a trademark registration or clearance search.

The publication review changed the prior game's title, route, piece set, board proportions, scoring, and presentation. These are design decisions, not a formula for legal clearance. The prior `/games/tetris` route was part of the unpublished working-tree addition and is not retained as a public alias.

The cited legal guidance is broadly consistent with these primary sources:

- [Brazil's Copyright Law, Article 8](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) excludes ideas, methods and game rules; creative expression and software raise separate questions.
- [Tetris Holding v. Xio Interactive (D.N.J. 2012)](https://www.govinfo.gov/content/pkg/USCOURTS-njd-3_09-cv-06115/pdf/USCOURTS-njd-3_09-cv-06115-0.pdf) illustrates that independently written code and a different title did not resolve copying of the game's overall expressive presentation. It is a U.S. district-court decision, not a Brazilian ruling or a blanket monopoly on falling-block rules.
- [Tetris.com's terms](https://tetris.com/terms-conditions) assert rights in its branding and content, and prohibit framing without permission. This game does not embed or load that service.

The engineering review does not establish legal permission or guarantee non-infringement. Assessing the actual design and any uncertain source-code rights remains a legal/provenance question.
