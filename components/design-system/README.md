# Design system

The site uses a quiet editorial system: flat warm gray/near-black canvases, one red accent, system typography, and spacing rather than raised panels. Styles are grouped by responsibility under `app/styles/`, imported by `app/globals.css`.

## Foundations

- System sans-serif only; no downloaded fonts. Weights 400, 600 and 700.
- Body 16px with 1.65 line height; desktop long-form text 18px with 1.75 line height. Fluid headings never truncate localized text.
- Outer container 1120px; 16px mobile and 32px desktop gutters. Reading content is at most 66ch. Wide diagrams may use the outer measure; code stays contained and copyable.
- Spacing: 4, 8, 12, 16, 24, 32, 48 and 64px. Section stacks own vertical spacing, avoiding nested margins.
- Light: `#f3f2ee` canvas, `#111111` text, `#525252` metadata, `#b11e2f` accent. Dark: `#0f1011` canvas, `#f3f4f4` text, `#b4bac2` metadata, `#ff495c` accent.
- Action foreground is white in light mode and `#111111` in dark mode. Keep action foreground separate from the link accent. Functional control borders use a stronger token than decorative separators.
- Cards have 12px corners and controls 8px. No panel shadows; only an open dropdown has a shallow shadow. A card is not a whole-card link.
- Projects without a published detail page use a transparent surface and dashed border, with a localized availability notice and plain title before the preview image. Keep their text at full contrast, without links, tab stops or hover-image feedback.

## Primitives

Import from `@/components/design-system`:

- `Container`: centered outer width.
- `SiteMain`: the single main landmark and `#main-content` skip/focus target.
- `SectionStack`: section rhythm; `as="div"` for grouping without section semantics.
- `Surface`: a content grouping without default elevation.
- `PageHeader`, `Eyebrow`, `Lead`, `MutedText`: page hierarchy.
- `Grid`: one column on small screens, two from 700px. The projects index uses three from 1024px, keeping cards at least 300px wide at that breakpoint.
- `Card`: neutral bordered collection item.
- `ChipRow`, `Chip`, `ChipButton`: metadata and explicit controls.
- `InlineLink`: underlined content link.
- `ButtonLink`: `primary`, `secondary` or `ghost` action; ordinary anchors for downloads/external destinations.

Reuse these primitives before adding a new layout abstraction. Reading pages use `reading-page`; Markdown uses `content-prose`. Keep long URLs wrapping without clipping the document.

## Interaction and resilience

The header scrolls normally. Its first focusable link skips to main content. Main navigation and language counterparts are present in server-rendered HTML; Home and About have distinct destinations. Keep core content and navigation useful with JavaScript disabled.

Theme and project-filter controls reserve their footprint but become available only when operational. Filtering retains any-selected-label semantics and announces a localized result count without moving focus. Outside clicks/taps dismiss the label dropdown without clearing selections or taking focus from the clicked target. Escape closes it and returns focus to its summary. Native disclosures work by keyboard and touch.

Focus outlines are immediate and visible. Controls aim for 44px targets. Colors transition over 140ms; navigation underlines and disclosure chevrons animate over 180ms ease-out. Buttons compress to 0.98 on press over 160ms. Images of projects with details and blog posts scale to 1.025 over 240ms on hover or keyboard focus within the card; the card and link targets stay stationary. Touch retains native press/disclosure feedback. Reduced motion disables animations, transitions, image zoom and button compression while retaining immediate control states.

`OrbitalPortrait` frames the home portrait with thin orbital paths, constellation details and two red satellites. The satellites move once on home render for 3.2s and 4.2s (the latter after 150ms), then settle; CSS transforms use cubic-bezier(0.2, 0.6, 0.3, 1). No automatic motion lasts more than five seconds. Reduced motion shows the final static positions. The footer repeats the celestial vocabulary with a static constellation divider. Both are server-rendered, decorative inline SVG, hidden from assistive technology, and make no asset request. Identity and actions appear first on mobile. No content is hidden behind entrance or scroll animations; no runtime animation dependency is needed.

See the [development guide](../../docs/development.md#production-browser-and-performance-checks) for browser regressions and reproducible production payload measurements. Automated tests supplement manual keyboard, screen-reader, contrast and physical-device review; they do not certify WCAG conformance.
