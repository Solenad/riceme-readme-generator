## Context

The card's info section (key-value rows beside the ASCII art) is currently hardcoded:

- `src/components/readme-builder.tsx` defines 13 `FIELD_DEFS` (`{key, label, color, placeholder}`) and stores values in a `Record<string, string>`.
- `src/app/api/public/readme.svg/route.ts` re-defines the same 13 rows in `getDefaultInfo(theme)` and renders the **raw key** as the label text (e.g. `distro`), while the builder UI shows capitalized labels (`Distro`) — an existing inconsistency.
- The card URL encodes values as flat `key=value` params; the SVG iterates its hardcoded defaults and overrides values if a param is present.
- Label column width is fixed (`keyColW = 110`); card height already grows dynamically with row count.
- The `host` row is semantically special: its value feeds the big header line.

Two sources of truth must stay in sync manually, and there is no way for users to rename rows, add rows, reorder, or recolor them.

## Goals / Non-Goals

**Goals:**
- Make the info rows user-customizable: editable labels, colors, order, visibility, add/remove/duplicate/reset.
- Enforce a 16-row cap in both builder and SVG route.
- Single source of truth for field definitions shared by builder and SVG.
- Backward compatibility: existing deployed card URLs keep rendering the same output.
- Keep the SVG layout mechanics (value wrapping, palette, stats section, ASCII side) intact.

**Non-Goals:**
- Presets/templates ("Neofetch", "Career", "Minimal") — deferred to a follow-up change.
- Multi-column grid layout for the info section.
- Drag-and-drop reordering — keyboard up/down controls first.
- Any persistence beyond the URL (no backend, no localStorage).

## Decisions

### D1: Shared field library `src/lib/fields.ts`
A new module becomes the single source of truth, imported by both the builder and the SVG route:

```ts
export interface InfoField {
  id: string       // stable, URL-safe slug; doubles as legacy value param name
  label: string    // rendered label text (editable)
  value: string
  color: string    // hex, editable
  visible: boolean
  placeholder: string
}

export const DEFAULT_FIELDS: InfoField[] = [
  // 13 rows: distro, host, uptime, kernel, school, shell, wm,
  // editor, languages, stack, db, tools, ai
  // labels = capitalized (current FIELD_DEFS labels)
  // colors = current FIELD_DEFS hexes (Catppuccin Maccinato palette)
  // placeholders = current FIELD_DEFS placeholders
]

export const MAX_FIELDS = 16
export function slugifyId(label: string, taken: Set<string>): string
export function parseFields(params: URLSearchParams): InfoField[]
export function serializeFields(fields: InfoField[]): URLSearchParams
```

Alternatives considered:
- *Keep two copies in sync* → rejected: this change exists precisely because that drifted (key-vs-label bug).
- *Encode all fields as one JSON param* → rejected: opaque URLs, breaks the legacy `key=value` override path.
- *Dense array params (`fl=v1~~~v2`)* → rejected: unreadable URLs, harder to debug, marginal size win.

### D2: URL encoding contract
- **Order param**: `f=distro,host,uptime,...` — comma-separated, ordered ids. Only present on builder-generated URLs.
- **Per-row params** (suffix convention, uniform for defaults and custom rows):
  - value: `{id}` (existing legacy name)
  - label: `{id}_label`
  - color: `{id}_color`
  - hidden: `{id}_hide=1`
- **Resolution order for a row** (SVG side):
  1. value = `params.get(id)` → else default value
  2. label = `params.get(id + "_label")` → else default label (custom rows: id)
  3. color = `params.get(id + "_color")` → else (defaults: default color; custom rows: theme palette by row index)
  4. hidden = `params.get(id + "_hide") === "1"`
- **Legacy path**: when `f` is absent, iterate `DEFAULT_FIELDS` and override values from params (exactly today's `buildInfo` semantics, preserving palette-rotated colors) — keeps old URLs byte-equivalent.
- The builder always emits the full `f=` list and per-row params for every row so URLs are self-describing.
- Shared `parseFields`/`serializeFields` live in `fields.ts` so the contract cannot drift between the two sides.

### D3: SVG rendering changes
- Replace `getDefaultInfo(theme)` usage with `parseFields(searchParams)`; keep the legacy fallback inside the parse (D2).
- Clamp parsed rows to `MAX_FIELDS` after parsing (defense in depth against hand-crafted URLs).
- **Label column auto-width**: `keyColW = max(110, ceil(maxLabelLength × 13 × 0.62) + 12)` measured over the rendered rows (13 is the label font size, 0.62 the mono char ratio already used for values).
- Header title unchanged: find row with `id === "host"` for the value, fall back to `username` if absent.
- Value wrapping (`wrapText`) and all layout below the rows (palette dots, stats, typewriter) are untouched.

### D4: Builder state and operations
- Replace `fields: Record<string, string>` with `fields: InfoField[]` initialized from a deep-cloned `DEFAULT_FIELDS` (with empty values).
- Operations: `updateRow(id, patch)`, `addRow()`, `removeRow(id)`, `moveRow(id, ±1)`, `duplicateRow(id)`, `toggleVisible(id)`, `resetFields()`.
- **Id generation**: at creation, `slugifyId` on the label; while the label is empty (new row) use `row-<n>`; ids are **stable after creation** even if the label later changes, so URLs and fetch mapping don't break.
- New row default color: rotate through `DEFAULT_FIELDS` colors cyclically.
- Label input `maxLength={32}` to bound card width; label dot and SVG label text use the resolved color.
- Row editor UI per row: label input, color input, value input, visibility toggle, reorder up/down, duplicate, delete. Header row: "Add row" button with a `n/16` counter; disabled at cap.

### D5: GitHub profile fetch
- `mapProfileToFields` now returns `{ id: value }` entries for the 5 known ids (`host`, `kernel`, `school`, `distro`, `uptime`) **only if that id exists** in the current rows. Values overwrite; labels, colors, and visibility are never touched; deleted rows are never re-added.

## Risks / Trade-offs

- **Row count cap and card height** → card height already grows with rows; 16 rows is a reasonable ceiling; the SVG clamp prevents URL abuse.
- **Long custom labels widening the card** → mitigated by auto key-column width plus `maxLength={32}` on the label input.
- **Legacy URL rendering drift** → the no-`f` fallback path preserves today's algorithm exactly; add a snapshot test comparing a legacy URL against the pre-change output.
- **URL length growth** → each row adds ~4 small params; the URL already carries LZ-compressed ASCII, so the marginal cost is acceptable. No action.
- **Id naming collisions** → `slugifyId` dedupes against existing ids with `-2`, `-3` suffixes.

## Migration Plan

- Pure client + URL change; no data migration.
- Deploy builder and SVG route together (the builder emits `f=` URLs, which the new SVG parses; the old SVG would ignore unknown params, so a mixed deploy degrades to default rendering).
- Rollback: revert the commit; legacy URLs are unaffected either way.

## Open Questions

- None blocking. Presets are deferred by decision; a `keyColW` snapshot threshold for very long labels can be tuned after visual QA.