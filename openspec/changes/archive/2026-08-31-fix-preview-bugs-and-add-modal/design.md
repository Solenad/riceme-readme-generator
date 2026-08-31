## Context

The README card preview on `/build` is generated server-side as an SVG via `GET /api/public/readme.svg`. The builder serializes all field state (labels, values, colors, visibility) into URL query params, which the SVG route parses and renders. The preview `<img>` element's `src` is derived from a `buildPreviewUrl()` call that uses debounced state.

Current issues traced through the data flow:
1. Empty rows (blank label + blank value) still render row numbers and allocate 26px height in the SVG
2. The `<img>` element has no React `key`, so React updates `src` in-place — the browser may return a cached/304 SVG response instead of fetching fresh
3. The SVG height accumulation loop runs *before* the empty-row check, so ghost rows push the stats section down
4. A trailing empty `<text>` element exists at the SVG bottom
5. No way to view the preview at full size without copying the URL

## Goals / Non-Goals

**Goals:**
- Fix all rendering bugs so the preview accurately reflects builder state
- Ensure color changes reliably appear in the preview
- Add a click-to-expand preview modal for full-size inspection
- Keep changes surgical — touch only the 2 files involved (route.ts, readme-builder.tsx)

**Non-Goals:**
- Refactoring the SVG layout system or theme engine
- Changing the URL serialization format
- Adding new npm dependencies
- Modifying the builder's field editing UX beyond the modal addition

## Decisions

### D1: Filter empty rows before height accumulation in SVG route

**Decision**: Move the `!hasLabel && !hasValue` check *before* `nextInfoY += rowHeight + rowGap`, and skip the row entirely (return empty string, don't advance `nextInfoY`).

**Rationale**: The current code allocates height for every row, then conditionally renders. This causes ghost rows to push content down even when invisible. Filtering first eliminates the vertical space waste.

**Alternative considered**: Keep the row number visible but transparent — rejected because users expect blank builder rows to produce no visible output.

### D2: Add `key={previewUrl}` to the `<img>` element

**Decision**: Use `key={previewUrl}` on the `<img>` tag so React fully unmounts and remounts the image element when the URL changes.

**Rationale**: Without a key, React reconciles the same `<img>` DOM node and just updates `src`. Browsers may return cached responses for the same-origin SVG even with different query params (especially under service workers or CDN caching). A full remount forces a clean fetch.

**Alternative considered**: Append a cache-busting timestamp to the URL — rejected because it creates a unique URL every render, defeating all caching and causing unnecessary network traffic.

### D3: Use native `<dialog>` element for the preview modal

**Decision**: Use the HTML `<dialog>` element with `showModal()` / `close()` for the preview modal, styled with the existing theme tokens. Animate open/close with `motion/react`'s `AnimatePresence`.

**Rationale**: Zero new dependencies. The native `<dialog>` handles Escape key, backdrop click, focus trapping, and accessibility out of the box. Matches the project's lean dependency philosophy.

**Alternative considered**: Radix UI Dialog — rejected because it adds a dependency for a simple use case that the native API handles.

### D4: Hover interaction uses CSS + minimal state

**Decision**: On hover over the preview container, apply `backdrop-blur-sm` to the `<img>` and show a `[ Click ]` text overlay. Use CSS `group`/`group-hover` classes instead of JS hover state to keep it purely presentational.

**Rationale**: No JS state needed for the hover effect. Tailwind's `group-hover` handles the blur + text reveal with zero re-renders.

## Risks / Trade-offs

- **[Risk] Empty row filtering changes visual output** → Users who intentionally placed empty rows as spacers will see them disappear. Mitigation: This matches the stated requirement in info-fields spec ("SVG renders empty rows with number only") which we're intentionally changing. The new behavior is more intuitive.
- **[Risk] `<dialog>` styling varies across browsers** → Mitigation: Apply explicit theme-based styling (bg, border, rounded) that overrides browser defaults. Test on Chromium and Firefox.
- **[Trade-off] `key={previewUrl}` causes full image reload on every change** → Acceptable because the SVG is lightweight (~5-15KB) and the builder already debounces at 500ms. The UX benefit of guaranteed-fresh previews outweighs the minimal extra bandwidth.
