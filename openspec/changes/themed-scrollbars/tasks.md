# Tasks: Themed Scrollbars

## 1. Global scrollbar theming (globals.css)

- [ ] 1.1 Add `color-scheme: dark` to `:root` in the existing `@layer base` block
- [ ] 1.2 Add universal standard-property rules: `scrollbar-width: thin; scrollbar-color: var(--border) transparent` on all elements (Firefox tier)
- [ ] 1.3 Add webkit pseudo-element rules: 8px width/height, transparent track and corner, thumb in `--border` with rounded-full shape
- [ ] 1.4 Add interaction states to the webkit thumb: hover → term-green blend at ~60% (`color-mix` or opacity equivalent), active/drag → full term-green

## 2. Info-rows overflow affordance (readme-builder.tsx)

- [ ] 2.1 Add bottom fade mask utility class (~24px, `mask-image: linear-gradient(to bottom, black calc(100% - 24px), transparent)`) to the info-rows scroll viewport div at readme-builder.tsx ~line 517
- [ ] 2.2 Visual QA: confirm faded card edge reads as intentional depth; if borders look glitched, swap mask for positioned gradient overlay div per design fallback (Decision 4)

## 3. Verification

- [ ] 3.1 Chromium: verify ghost idle / green-hover / solid-drag thumb states on document bar, info rows, snippet `<pre>` horizontal bars, ASCII textarea
- [ ] 3.2 Verify theme select portal renders a dark scrollbar via `color-scheme` fallback
- [ ] 3.3 Verify drag-reorder inside the scrolled info-rows panel behaves exactly as before (overlay follows cursor, siblings shift, drop commits)
- [ ] 3.4 Firefox spot-check: thin dark bars with correct two colors on at least the info rows and one snippet preview
- [ ] 3.5 Confirm no layout shift or logic change: `git diff` touches only `globals.css` and `readme-builder.tsx`; `package.json` unchanged
