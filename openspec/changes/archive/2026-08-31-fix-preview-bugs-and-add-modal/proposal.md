## Why

The README card preview on the `/build` page has several rendering bugs that degrade the user experience: empty rows display ghost artifacts (row numbers + vertical space) when they should be invisible, per-row color changes don't reliably reflect in the preview SVG, and the SVG height calculation allocates space before checking if rows are empty. Additionally, the preview image is small and hard to inspect — a click-to-expand modal would let users verify their card at full size before copying the snippet.

## What Changes

- **Fix ghost rows in SVG preview**: Rows with empty label AND empty value will be completely hidden in the SVG (no row number, no vertical space allocated), matching user expectation that blank builder rows produce no visible output.
- **Fix preview cache staleness**: Add a `key` prop to the preview `<img>` element keyed on the full preview URL, guaranteeing React fully remounts the image element when the URL changes so the browser always fetches the latest SVG.
- **Fix SVG height calculation order**: Restructure the SVG render loop to filter out empty rows *before* accumulating vertical space, preventing ghost rows from pushing stats cards and palette dots downward.
- **Clean up minor SVG artifacts**: Remove the empty trailing `<text>` element and fix the header fallback to gracefully handle empty host + empty username.
- **Add preview modal**: On hover over the preview image, apply a subtle blur + `[ Click ]` overlay text. Clicking opens a dialog/modal showing the full-size SVG preview. No close button — clicking the backdrop or pressing Escape closes it.

## Capabilities

### New Capabilities
- `builder-preview-modal`: Click-to-expand modal for the README card preview image, with hover blur + text overlay interaction.

### Modified Capabilities
- `info-fields`: The SVG rendering requirements for empty rows are changing — rows with both empty label and empty value SHALL be completely hidden (no number rendered, no height allocated), instead of rendering index-only rows. The existing spec at line 163-172 ("Empty row numbering" and "SVG renders empty rows with number only") will need updating.

## Impact

- **SVG route** (`src/app/api/public/readme.svg/route.ts`): Restructure the `infoRows` render loop to filter empty rows before height allocation; remove empty trailing `<text>` element; fix header fallback.
- **Builder component** (`src/components/readme-builder.tsx`): Add `key={previewUrl}` to the preview `<img>`; add hover overlay state + modal dialog component.
- **No new dependencies**: The modal can be built with existing `motion/react` (AnimatePresence) and native `<dialog>` element, matching the project's zero-new-deps philosophy.
- **Spec update**: `openspec/specs/info-fields/spec.md` lines 163-172 will need a delta spec updating the empty row rendering requirement.
