## Why

The `customizable-info-fields` change (just archived) built the foundation for user-editable info rows — add, delete, reorder, color, hide, duplicate, reset. But three UX issues remain:

1. **No visual feedback on row order.** When a user reorders rows (up/down or drag-drop), there's no indicator in the builder *or* the rendered SVG that confirms the new order. Row numbering solves this instantly.
2. **Default rows are pre-filled.** `resetFieldsToDefaults()` returns 13 rows with hardcoded labels ("Distro", "Host", etc.) and values ("Windows 11", "Solenad"). This is confusing for new users who just want a blank slate. New defaults should be empty rows with "Label" / "Value" placeholders.
3. **Reordering is clunky.** Up/down arrow buttons work but feel mechanical. Drag-and-drop provides direct manipulation and is expected in list-editing UIs.

## What Changes

- **SVG row numbering.** Each rendered row gets a two-digit index prefix (`01`, `02`, …) in the info column. Number is display-only — not encoded in the URL.
- **Builder row numbering.** Each row card in the builder shows its index. Numbers update instantly on reorder/add/delete.
- **Placeholder-only defaults.** New rows and reset rows have empty label + empty value. Placeholder text is "Label" and "Value" respectively. No more pre-filled Distro/Host on reset.
- **Smooth reorder animation.** Rows animate to their new position when reordered (framer-motion `layout` + `Reorder`).
- **Drag-and-drop reordering.** Users can drag rows by a handle to reorder them, replacing the current up/down buttons. (Or supplementing — will decide in design.)

## Capabilities

### New Capabilities

(none — all changes are refinements to the existing `info-fields` capability)

### Modified Capabilities

- `info-fields`: The following requirements are changing:
  - **Row numbering** — new requirement: each row is prefixed with its 1-based index in the SVG and builder. Display-only, not in URL.
  - **Default row state** — modified requirement: reset/add produces empty label + empty value with placeholder text, not pre-filled labels.
  - **Reorder mechanism** — modified requirement: reorder via drag-and-drop (not just up/down buttons). Smooth animation on all reorder events.

## Impact

- `src/lib/fields.ts` — `resetFieldsToDefaults()` and `addRowToFields()` return empty labels/values with placeholder metadata.
- `src/app/api/public/readme.svg/route.ts` — render row index prefix, adjust layout for number column.
- `src/components/readme-builder.tsx` — add row numbers, drag-and-drop (likely `@dnd-kit/sortable` or framer-motion `Reorder`), animation on add/remove/reorder.
- `package.json` — possible new dependency (`@dnd-kit/core`, `@dnd-kit/sortable`) if framer-motion Reorder is insufficient.
- `src/lib/fields.test.ts` — update tests for new default behavior.
