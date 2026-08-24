# Design: Themed Scrollbars

## Context

The site is dark-only (Catppuccin Macchiato) on Tailwind v4 with JetBrains Mono. No scrollbar styling exists anywhere in the codebase, so every scrollable surface — the info-rows panel (`readme-builder.tsx:517`, already capped at `max-h-[420px] overflow-y-auto`), the snippet `<pre>` blocks on `/` and `/build`, the ASCII textarea, the theme select portal, and the document bar — renders native light-gray browser chrome that clashes with the palette.

Exploration surfaced seven scroll surfaces and two implementation paths: global CSS pseudo-element styling vs. Radix `ScrollArea` components (already installed but unused). Decisions were locked with the user during exploration.

## Goals / Non-Goals

**Goals:**
- All scroll surfaces share one themed treatment defined once in `globals.css`
- Ghost-at-rest, accent-on-interaction thumb behavior matching the site's existing hover language (e.g., copy buttons scale/brighten on hover)
- Overflow affordance on the info-rows list via a static bottom fade
- Zero new dependencies; zero logic changes

**Non-Goals:**
- Radix `ScrollArea` adoption anywhere (see Decision 1)
- Pixel-parity in Firefox (colors yes, geometry/hover states no)
- `scrollbar-gutter: stable` (deferred; revisit only if layout shift is noticed)
- Styling scrollbars inside the generated SVG card (server-rendered image, not DOM)

## Decisions

### 1. Global CSS over Radix ScrollArea
**Choice**: Style `::-webkit-scrollbar*` pseudo-elements + standard `scrollbar-color`/`scrollbar-width` in one `@layer base` block in `globals.css`.

**Why**: One CSS block covers all seven surfaces simultaneously — including portals and future containers — for ~20 lines and zero TSX churn. Radix would require wrapping each surface manually, and its custom viewport is a known friction point for dnd-kit pointer capture during row reordering inside exactly the container we're touching. The info rows are drag-reorderable; we will not put a custom scrolling viewport under them.

**Alternative rejected**: Radix ScrollArea gives Firefox pixel-parity, at the cost of component restructuring on both pages and interaction risk in the highest-stakes surface.

### 2. Ghost/Accent hybrid token mapping
**Choice**:

| State | Token | Value |
|---|---|---|
| Idle thumb | `--border` | `#494d64` |
| Track | transparent | — |
| Hover thumb | term-green @ ~60% | blend of `#a6da95` |
| Active/dragging thumb | term-green | `#a6da95` |
| Geometry | 8px × 8px, rounded-full | webkit tier |
| Corner | transparent | avoids white square if a `<pre>` ever scrolls both axes |

**Why**: Mirrors the site's interaction grammar — quiet chrome that answers input. The copy button already brightens/scales on hover; the scrollbar now does the same.

### 3. Two-tier browser strategy
**Choice**: Chromium/Safari get the full hybrid via `::-webkit-scrollbar*`; Firefox gets `scrollbar-width: thin` + `scrollbar-color: var(--border) transparent` applied globally (the universal selector). `color-scheme: dark` on `:root` as a baseline so any unstyled surface (portals) renders dark-native.

**Why**: Standard properties can't express hover/drag states or radius; webkit pseudo-elements aren't standard. Accepting the Firefox degradation keeps the solution dependency-free. `color-scheme` also fixes Chrome's form-control chrome for free.

### 4. Static fade mask over scroll-aware detection
**Choice**: A single Tailwind arbitrary-value utility applying `mask-image: linear-gradient(to bottom, black calc(100% - 24px), transparent)` to the existing info-rows viewport div.

**Why**: Default fields (~7 rows ≈ 460–490px) already exceed the 420px cap, so the list overflows by default — a static mask is truthful in practice without scroll-state JS. CSS-only scroll-awareness isn't reliably available.

**Fallback if it looks wrong**: Card borders may read oddly when faded through a mask. If so, swap to an absolutely-positioned gradient overlay div (same visual, doesn't fade the card borders). Decide visually during implementation; overlay is the escape hatch.

### 5. Implementation footprint
- `src/app/globals.css`: append one `@layer base` block (~20 lines): `:root { color-scheme: dark }`, universal `scrollbar-width`/`scrollbar-color`, webkit pseudo-element rules using theme tokens.
- `src/components/readme-builder.tsx`: add one utility class to the info-rows motion.div (line ~517).

No other files change. No dependencies change.

## Risks / Trade-offs

- [Firefox shows no hover/drag accent states] → Accepted degradation, documented in spec; colors and thinness still match the palette.
- [Static mask fades the last visible row even in edge cases where content fits] → Verified default state overflows; fallback gradient-overlay approach documented if visual QA disagrees.
- [`::-webkit-scrollbar` is non-standard and could deprecate someday] → Standard-property tier (`scrollbar-color`) remains as graceful fallback; worst case surfaces revert to dark-native bars via `color-scheme`.
- [Mask could interfere with hit-testing] → It cannot: `mask-image` is purely paint-level; pointer events pass through unchanged. Drag reorder spec scenario guards this.
- [Global selector styles surfaces nobody reviewed] → Treatment is intentionally uniform; every current surface was enumerated during exploration (info rows, snippets ×5, textarea, select portal, document).

## Migration Plan

Single commit, deploy-safe: pure presentation CSS + one class addition. Rollback = revert the commit. No data, URL, or API impact; generated SVG cards unaffected (they don't render DOM scrollbars).

## Open Questions

None blocking. The mask-vs-overlay visual call is delegated to implementation-time QA per Decision 4's documented fallback.
