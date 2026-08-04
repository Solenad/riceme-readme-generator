## Why

The info section of the generated card (the key-value rows beside the ASCII art) is hardcoded: 13 fields are defined twice — once in `readme-builder.tsx` and once in the SVG route — and must stay in sync manually. Users cannot rename labels, add rows, or remove rows, and the SVG renders raw keys (e.g. `distro`) as labels while the builder UI shows capitalized ones (`Distro`), an inconsistency baked in from day one. This change makes the rows fully user-customizable.

## What Changes

- Field model becomes an **ordered list** of `{ id, label, value, color, visible }` objects instead of a `Record<string, string>`.
- **Editable labels**: users can rename the label text of any row; the SVG renders the label, not the raw key. Empty labels fall back to the id.
- **Add / remove rows**: a "+ Add row" button creates new rows; rows can be deleted. Total rows capped at **16** (enforced in the builder and clamped in the SVG route).
- **Per-row color picker**: each row's accent color (label text in the SVG, dot in the builder) becomes editable via a native color input.
- **Reorder** rows with up/down controls.
- **Show/hide** individual rows; hidden rows render nothing in the SVG but keep their data.
- **Duplicate** a row; **reset to defaults** restores the original 13 rows.
- Shared field definitions move to a single `src/lib/fields.ts` consumed by both builder and SVG route (removes the two-sources-of-truth duplication).
- URL encoding: an ordered `f=<id,id,...>` param plus per-row overrides `{id}=value`, `{id}_label=`, `{id}_color=`, `{id}_hide=1`. Existing URLs without `f=` continue to render via defaults (**backward compatible**).
- GitHub profile fetch overwrites **values only** for rows that still exist; it never re-adds deleted rows and never touches custom labels/colors.

## Capabilities

### New Capabilities
- `info-fields`: Customizable info rows on the README card — editable labels, add/remove with a 16-row cap, per-row color, reorder, show/hide, duplicate, reset, and shared field definitions with URL serialization.

### Modified Capabilities
<!-- None: openspec/specs/ is currently empty; the info section is not yet spec'd. -->

## Impact

- `src/components/readme-builder.tsx` — field state, row editor UI (label input, color picker, reorder/hide/duplicate/delete controls, add-row button, reset), URL building.
- `src/app/api/public/readme.svg/route.ts` — parse the ordered `f=` list and per-row params, render labels instead of keys, clamp row count, keep defaults fallback.
- `src/lib/fields.ts` — **new** shared source of truth: field definitions, defaults, max row count, param naming conventions, slugify helper.
- `src/lib/compress.ts`, `src/lib/themes.ts` — untouched.
- Existing deployed card URLs remain valid (backward compatible).
