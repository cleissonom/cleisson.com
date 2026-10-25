# Browser games

[Development](development.md) · [Architecture](architecture.md)

The games index, `/games/falling-blocks`, `/games/sudoku`, and `/games/4096` are published under `en-US`, `pt-BR`, and `es-ES`. Their HTML and Markdown share localized descriptions, rules, keyboard controls, and accessibility information. Gameplay requires JavaScript and WebAssembly. Falling Blocks draws its visual board on a 2D canvas and does not have a screen-reader equivalent. Sudoku and 4096 use HTML grids with keyboard controls and cell labels.

Falling Blocks uses a 12×20 board and six shapes containing one to five cells. Only complete horizontal rows disappear. The rows above move down intact, preserving their holes and cell order. Each clear awards `90 × cleared rows × level`; the level increases every six rows. The renderer uses a uniform green grid with beveled square tiles; each of the six shapes keeps its own bright color on the board and in the previews. A translucent shadow shows where the active piece will land. The personal best is saved in browser local storage under `falling-blocks.best-score`, shared across locales on the same origin. It updates during play and survives restart and reload; clearing site data removes it. Invalid records are ignored, and unavailable storage leaves the record in memory for the current visit. The board itself is not persisted. The game has no audio, account, or online leaderboard. Existing site analytics remain governed by the site's privacy notice.

Sudoku uses a classic 9×9 grid with one solution. Its seeded Rust generator removes clues only while the puzzle remains unique, with bounded generation attempts and solver work. Easy, Medium, and Hard start with 42, 35, and 29 clues; these labels describe clue counts, not a certified solving-technique grade. Original clues are immutable. Conflicts mark repeated digits in a row, column, or box, rather than comparing every entry with the hidden solution. Pencil notes are manual; undo reverses an entry or note change.

Sudoku hints explain a naked single, a hidden single in a row, column, or box, or a correction based on the solution. When no simple deduction is available, the hint explicitly labels a revealed solution value. Reading a hint marks the puzzle as assisted even if the hint is dismissed or its change is undone. Only completed puzzles without hints qualify for best times. The timer counts active play and pauses when the game is hidden, loses focus, or is manually paused.

Sudoku saves the current clues, entries, notes, elapsed time, difficulty, and hint use under `sudoku.progress`; best unassisted times per difficulty use `sudoku.best-times`. These records stay in browser local storage and are shared between locales on the same origin. A saved puzzle is validated by the engine and resumes paused. Undo history is not persisted. Clearing site data removes progress and records; unavailable storage still permits play for the current visit. Sudoku has no account, server-side game state, or online leaderboard. It adds no telemetry beyond the existing site analytics covered by the privacy notice.

4096 uses a 4×4 board. Arrow keys, WASD, swipes, and direction buttons slide all tiles in one direction. Adjacent equal tiles merge once per move: a row of `2, 2, 2, 2` becomes `4, 4`, not `8`. The score increases by the value of each newly merged tile. A changed move spawns one new 2 or 4 tile in an empty cell and increases the move count; an unchanged move does neither. Reaching a 4096 tile meets the goal and offers continued play. The game ends when the board is full and no horizontal or vertical neighbors can merge.

4096 stores its best score under `4096.best-score` and its current board, score, move count, random-generator state, and continued-play choice under `4096.progress`. Records stay in browser local storage and are shared between locales on the same origin. Starting a new game keeps the best score; clearing site data removes the saved game and record. Unavailable storage permits play in memory for the current visit. 4096 has no account or server-side game state and adds no telemetry beyond the existing site analytics.

## Implementation and verification

The same game works with keyboard controls on a laptop and touch buttons on a phone. The board keeps square cells while its displayed size adapts to the viewport; portrait and landscape layouts keep the board and controls together. Fullscreen uses the browser API when available and a viewport-filling layout otherwise. The exit button remains available in both modes. Changing display mode preserves the current run and personal best. Browsers that use the fallback may retain their address bar.

- `wasm/falling-blocks/`: dependency-free Rust rules, state machine, and WASM ABI. `src/lib.rs` documents memory regions and exports.
- `wasm/sudoku/`: dependency-free Rust generation, solving, validation, candidates, hints, and WASM ABI.
- `wasm/merge-4096/`: dependency-free Rust sliding, merging, scoring, spawning, and WASM ABI.
- `lib/falling-blocks/`: TypeScript ABI reader and canvas renderer.
- `lib/sudoku/`: TypeScript ABI reader and browser storage validation.
- `lib/merge-4096/`: TypeScript ABI reader and browser storage validation.
- `components/games/`: client lifecycle, controls, and server-rendered rules.
- `data/games.ts`, localized dictionaries, `data/sudoku/`, and `data/merge-4096/`: published slugs, metadata, and game copy. Games are separate from the professional project/evidence registry.
- `public/games/falling-blocks/falling-blocks.wasm`: committed artifact served by Next.js. Ordinary npm builds do not need Rust.
- `public/games/sudoku/sudoku.wasm`: committed Sudoku artifact served by Next.js.
- `public/games/4096/4096.wasm`: committed 4096 artifact served by Next.js.

Use Rust **1.98.1**, matching the build script and CI, with the `wasm32-unknown-unknown` target. No Cargo packages need downloading. If necessary, install the compiler with `rustup toolchain install 1.98.1 --profile minimal --target wasm32-unknown-unknown`, then select it for the build with `RUSTUP_TOOLCHAIN=1.98.1`.

```bash
npm run games:wasm
npm run games:wasm:check
cargo fmt --manifest-path wasm/falling-blocks/Cargo.toml -- --check
cargo clippy --manifest-path wasm/falling-blocks/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path wasm/sudoku/Cargo.toml -- --check
cargo clippy --manifest-path wasm/sudoku/Cargo.toml --all-targets -- -D warnings
cargo fmt --manifest-path wasm/merge-4096/Cargo.toml -- --check
cargo clippy --manifest-path wasm/merge-4096/Cargo.toml --all-targets -- -D warnings
npm test
```

`games:wasm` runs native tests, builds all three binaries, and verifies their ABIs in Node. The build normalizes local Rust source paths to the compiler's canonical prefix so installed source locations do not change the artifacts. `games:wasm:check` rebuilds and compares bytes without replacing the published artifacts; CI runs it to catch stale binaries. Rebuild after changing Rust code, including line changes that can affect embedded panic locations.

Browser checks cover completing a row through normal keyboard play, preserving incomplete rows and holes, personal-best persistence and unavailable storage, keyboard focus, phone portrait/landscape touch controls, fullscreen entry/exit and browser API fallback, pause/resume/restart, failed loading and retry, loading-disabled controls, and all locales without JavaScript. The clearing test fixes the random seed and clock so the same placements exercise the real engine every time, then checks the visible line count and settled canvas. Run the existing production-browser workflow in [development.md](development.md), then:

```bash
BROWSER_BASE_URL=http://localhost:3123 npm run test:browser -- tests/browser/games.spec.mjs tests/browser/game-clearing.spec.mjs tests/browser/game-best-score.spec.mjs tests/browser/game-display.spec.mjs
BROWSER_BASE_URL=http://localhost:3123 npm run test:browser -- tests/browser/sudoku.spec.mjs tests/browser/sudoku-display.spec.mjs tests/browser/sudoku-focus.spec.mjs
BROWSER_BASE_URL=http://localhost:3123 npm run test:browser -- tests/browser/merge-4096.spec.mjs tests/browser/merge-4096-display.spec.mjs
```

Sudoku checks exercise the real WASM engine, immutable clues, conflicts, notes, undo, hints, completion, active timing, saved progress and records, keyboard navigation, and touch layouts. Localized HTML and Markdown contracts keep its rules and storage disclosures available without JavaScript. Browser emulation does not replace a physical-device or screen-reader review.

4096 checks exercise merges through the real WASM engine, unchanged moves, scoring, goal continuation, game over, saved progress and best score, keyboard focus, swipes, direction buttons, and responsive layouts. Its HTML and Markdown expose the same localized rules and storage disclosures without JavaScript.

For development, use `http://localhost:3123` with `npm run dev -- --port 3123`. Next.js development origin checks can reject JavaScript requests when a server started with the default hostname is accessed through `127.0.0.1`; the production browser workflow avoids that development-only restriction.

## Publication and asset provenance

The 4096 engine and interface were written for this site. No external game source, artwork, audio, or other game assets were imported for 4096.

The Sudoku engine and interface were written for this site. Puzzles are generated locally; no external puzzle collection, game code, artwork, or audio was imported for Sudoku.

The Falling Blocks engine adapts the prototype supplied by the owner as their own creation. An adjacent standalone JavaScript prototype was also inspected; it has no runtime dependencies or separate license file. No external game code was downloaded for that change. This review records the supplied provenance and does not independently establish copyright ownership.

The canvas graphics added here are drawn by repository code. No external artwork, fonts, music, recordings, logos, or game assets were added. Site fonts and other existing site assets retain their existing provenance. “Falling Blocks” is used as a descriptive title; this work does not represent a trademark registration or clearance search.

The publication review changed the prior game's title, route, piece set, board proportions, scoring, and presentation. These are design decisions, not a formula for legal clearance. The prior `/games/tetris` route was part of the unpublished working-tree addition and is not retained as a public alias.

The cited legal guidance is broadly consistent with these primary sources:

- [Brazil's Copyright Law, Article 8](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) excludes ideas, methods and game rules; creative expression and software raise separate questions.
- [Tetris Holding v. Xio Interactive (D.N.J. 2012)](https://www.govinfo.gov/content/pkg/USCOURTS-njd-3_09-cv-06115/pdf/USCOURTS-njd-3_09-cv-06115-0.pdf) illustrates that independently written code and a different title did not resolve copying of the game's overall expressive presentation. It is a U.S. district-court decision, not a Brazilian ruling or a blanket monopoly on falling-block rules.
- [Tetris.com's terms](https://tetris.com/terms-conditions) assert rights in its branding and content, and prohibit framing without permission. This game does not embed or load that service.

The engineering review does not establish legal permission or guarantee non-infringement. Assessing the actual design and any uncertain source-code rights remains a legal/provenance question.
