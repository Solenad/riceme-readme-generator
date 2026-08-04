## 1. Shared field library

- [ ] 1.1 Create `src/lib/fields.ts` with `InfoField` interface and `DEFAULT_FIELDS` (the 13 existing rows with capitalized labels, current colors, and placeholders from `FIELD_DEFS`)
- [ ] 1.2 Add `MAX_FIELDS = 16` constant and `slugifyId(label, taken)` helper (URL-safe slug, dedupe with `-2`/`-3` suffixes, `row-<n>` fallback for empty labels)
- [ ] 1.3 Implement `parseFields(params)` — ordered `f=` list + per-row value/label/color/hide params, with the legacy no-`f` fallback (defaults + value overrides + palette colors) — and `serializeFields(fields)` producing the full `f=` + per-row params
- [ ] 1.4 Add tests for `parseFields`/`serializeFields`: legacy URL, label/color overrides, hidden rows, custom rows, row clamp at 16

## 2. SVG route

- [ ] 2.1 Replace `getDefaultInfo(theme)`/`buildInfo` with `parseFields(searchParams)` (preserving legacy no-`f` URL behavior byte-for-byte)
- [ ] 2.2 Render the resolved **label** (not the raw id), the resolved color, and skip hidden/empty rows
- [ ] 2.3 Auto-size the label column (`keyColW = max(110, maxLabelLen × charWidth + padding)`) so long custom labels don't clip
- [ ] 2.4 Clamp parsed rows to `MAX_FIELDS` (defense in depth against hand-crafted URLs)
- [ ] 2.5 Confirm the header title still falls back to `username` when no `host` row exists

## 3. Builder

- [ ] 3.1 Replace `fields: Record<string, string>` with `fields: InfoField[]` (initialized from `DEFAULT_FIELDS` with empty values) and add row operations: `updateRow`, `addRow`, `removeRow`, `moveRow(id, ±1)`, `duplicateRow`, `toggleVisible`, `resetFields`
- [ ] 3.2 Rework the field grid to render a per-row editor: label input (`maxLength=32`), color input, value input, visibility toggle, reorder up/down, duplicate, delete
- [ ] 3.3 Add the "Add row" button with an `n/16` counter; disable it at the cap; new rows get a generated id and cycled default color
- [ ] 3.4 Replace `buildPreviewUrl`'s manual param loop with `serializeFields` (emit `f=` + per-row params)
- [ ] 3.5 Update `mapProfileToFields` to overwrite values **only for ids that exist** in the current rows (never re-add deleted rows, never touch labels/colors/visibility)

## 4. Verification

- [ ] 4.1 Run lint + typecheck + production build clean
- [ ] 4.2 Verify a legacy URL (no `f=`) renders identically to the pre-change output
- [ ] 4.3 Manual QA pass: rename, add, remove, recolor, reorder (boundaries included), hide/unhide, duplicate, reset, GitHub fetch (existing + deleted ids), and add-row behavior at the 16 cap