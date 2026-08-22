## Context

The `customizable-info-fields` change (archived 2026-08-22) introduced user-editable info rows: add, delete, reorder (up/down buttons), color, hide, duplicate, reset. The core data model (`InfoField[]`), URL encoding (`f=` + per-row params), and SVG rendering are all working.

This change addresses three UX gaps:

1. **No visual order feedback.** When rows are reordered in the builder, the SVG doesn't indicate the new order. Row numbering solves this.
2. **Pre-filled defaults are confusing.** `resetFieldsToDefaults()` returns 13 rows with hardcoded labels and values. New users expect a blank slate.
3. **Up/down buttons are clunky.** Direct manipulation (drag-and-drop) is the expected interaction for list reordering.

## Goals / Non-Goals

**Goals:**
- Row numbering in SVG (display-only, not in URL)
- Row numbering in builder
- Placeholder-only defaults (empty label + value, placeholder text "Label" / "Value")
- Smooth reorder animation (rows glide to new position)
- Drag-and-drop reordering

**Non-Goals:**
- Changing the URL encoding scheme (numbers are display-only)
- Changing the 16-row cap
- Changing the color picker or visibility toggle
- Changing the GitHub profile fetch behavior

## Decisions

### 1. Row numbering layout

**Decision:** Two-digit zero-padded index (01, 02, ...) rendered in a fixed-width column before each row.

**SVG layout:**

```
[infoX]  [number 20px] [gap 5px] [label/keyColW] [gap 5px] [value/maxValueW]
   01                    Distro                      Windows 11
```

- Number font: `font-size="10"`, `fill="${theme.muted}"`, `font-family="monospace"`
- Number column: 20px fixed width
- Label column: starts at `infoX + 25`
- Value column: starts at `infoX + 25 + keyColW`

**Builder layout:**
- Index displayed as monospace span before the row card
- Format: `01`, `02`, etc.
- Positioned left of the color picker

**Rationale:** Fixed-width number column keeps alignment clean. Two digits handle up to 99 rows (well above the 16-row cap). Monospace font ensures consistent width.

### 2. Default row state

**Decision:** `resetFieldsToDefaults()` returns 2 rows with empty label and value. `addRowToFields()` also produces empty label + value.

**Implementation:**

```typescript
// resetFieldsToDefaults()
return [
  { id: "distro", label: "", value: "", color: palette[0], visible: true, placeholder: "Value" },
  { id: "host",   label: "", value: "", color: palette[1], visible: true, placeholder: "Value" },
];

// addRowToFields() - new row
{ id: slugifiedId, label: "", value: "", color: nextPaletteColor, visible: true, placeholder: "Value" }
```

**Rationale:** Empty defaults let the user start fresh. IDs remain stable ("distro", "host") for GitHub fetch compatibility. Placeholder text ("Label" for label input, "Value" for value input) guides the user.

**SVG behavior with empty rows:**
- Empty label + empty value: row renders with just the number (no text)
- Empty label + non-empty value: value rendered at label position (no indent)
- Non-empty label + empty value: label rendered, value blank

### 3. Drag-and-drop library

**Decision:** Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop reordering.

**Alternatives considered:**
- **Framer-motion Reorder**: Built-in, but limited customization for drag handles and accessibility. Tightly coupled to framer-motion's animation model.
- **Native HTML5 DnD API**: No dependency, but poor mobile support, no animation, verbose boilerplate.
- **react-beautiful-dnd**: Deprecated (Atlassian stopped maintaining). Not recommended.

**Rationale:** `@dnd-kit` is the most maintained, accessible, and customizable option. It provides:
- Keyboard accessibility out of the box
- Screen reader support
- Drag handles (users grab a handle, not the whole row)
- Smooth animation via `useSortable`
- Composable with framer-motion — **but only if framer-motion never writes `transform`/`layout` to sortable nodes** (see Decision 4 and Resolved Issues).

**Dependency impact:** +2 packages (`@dnd-kit/core`, `@dnd-kit/sortable`). Both are small (~15KB gzipped combined).

### 4. Animation strategy

**Decision:** `@dnd-kit` exclusively owns positional animation on sortable rows (its `transform`/`transition` from `useSortable`). Framer-motion is restricted to **opacity-only** fades for add/remove; it must never write `transform`, `layout`, or `y` to a sortable node.

**Approach:**
- Row wrapper is a **plain `<div>`** carrying dnd-kit's `ref={setNodeRef}` + inline `style` (`CSS.Transform.toString(transform)`, `transition`, dragged-row opacity 0)
- Inner `motion.div` animates **opacity only** (`initial={{ opacity: 0 }}` / `animate` / `exit`) — no `layout` prop, no `y`
- `AnimatePresence` in default `sync` mode (NOT `mode="popLayout"`)
- `DragOverlay` renders a static replica of the row that follows the cursor while the real row is invisible
- Sibling rows glide open/closed purely via dnd-kit's built-in transitions — no extra animation library involvement

**Behavior:**
- **Grab**: source row goes invisible (`opacity: 0`), overlay appears at cursor
- **Drag**: siblings shift via dnd-kit transforms with smooth transitions
- **Drop**: overlay disappears, row settles into its new slot permanently
- **Add/Remove**: opacity fade only

**Rationale:** framer-motion's `layout` and transform-based enter/exit animations write to the same `style.transform` property dnd-kit imperatively manages. On any re-render mid-drag (e.g. `setActiveId`), framer-motion restomps dnd-kit's transforms, desynchronizing measured rects from the visual layout — which breaks drop targeting. This was a real bug; see Resolved Issues #1.

> **Superseded note:** An earlier revision of this decision proposed combining @dnd-kit with framer-motion `layout`. That combination is invalid for sortable lists and caused bug #1 below.

### 5. Row numbering in empty state

**Decision:** Row numbers always render, even when label and value are empty.

**SVG behavior:**
- Row with empty label + empty value: renders number only (no text)
- This provides visual structure even when the user hasn't filled in data yet

**Builder behavior:**
- Row numbers always visible, even for empty rows
- Numbers update instantly on add/remove/reorder

## Resolved Implementation Issues (Lessons Learned)

Bugs hit during implementation and their verified fixes. Recorded so future changes don't re-introduce or re-chase them.

### Issue 1: Rows could not be dropped above / between other rows

**Symptom:** Dragging a row downward worked, but dropping it above a previous row silently failed — siblings snapped back and no reorder committed.

**Root cause — transform ownership conflict.** Each sortable row allowed two libraries to write to the same `style.transform`:

- `@dnd-kit` imperatively sets `el.style.transform = translate3d(...)` to shift sibling rows and make space
- framer-motion (`layout` prop and/or `y` in `initial/animate/exit`) reapplies its own transform from internal motion values on every React render

Mid-drag state updates (`setActiveId` on drag start) triggered a re-render; framer-motion stomped dnd-kit's transforms back to `translateY(0)`. The strategy's measured droppable rects then matched the *unshifted* layout while the screen showed shifted rows — collision results pointed at the wrong rows and drops above/between were discarded.

**Failed hypotheses (do not retry):**
- Switching collision detection alone (`closestCenter` → `closestCorners` → `rectIntersection`) — did not help; detection was never the bug
- Removing the scrollable container to test measurement interference — not the cause
- `visibility: hidden` vs `opacity: 0` on the dragged row — cosmetic difference only, unrelated

**Fixes applied (all required together):**

| # | Fix | Why |
|---|-----|-----|
| 1 | Row wrapper is a plain `<div ref={setNodeRef} style={style}>`; framer-motion moved to an inner opacity-only `motion.div` | Exactly one owner for `transform`: @dnd-kit |
| 2 | Removed `layout` prop and all `y` values from sortable row animations | framer-motion must never write transform to sortable nodes |
| 3 | Collision detection set to `closestCenter` | Recommended default for vertical sortables in legacy `@dnd-kit/core`; `rectIntersection` is wrong here because sparse lists don't guarantee overlap |
| 4 | Single drag handle with `setActivatorNodeRef` + `touch-none`, listeners removed from the row-number badge | Correct activator node for keyboard focus; prevents touch-scroll hijack on mobile |
| 5 | Removed `AnimatePresence mode="popLayout"` (default sync mode) | popLayout absolutely-positions exiting nodes, briefly corrupting rect measurements during delete animations |
| 6 | Added `onDragCancel={() => setActiveId(null)}` | Overlay could remain stuck if a drag was cancelled (Esc) mid-flight |

### Issue 2: Docs/API mismatch — new dnd-kit site vs installed legacy package

dndkit.com currently documents the **new** `@dnd-kit/react` package, where collision detection is configured **per droppable** via a `collisionDetector` option on `useSortable`/`useDroppable`. This project uses the **legacy** `@dnd-kit/core` + `@dnd-kit/sortable` packages, where collision detection is a single global `collisionDetection` prop on `<DndContext>` and built-ins are imported from `@dnd-kit/core` itself (`closestCenter`, `closestCorners`, `rectIntersection`, ...).

When consulting dnd-kit docs, check which API generation the page targets ("Latest" vs "Legacy" toggle). Per-droppable config does not exist in the installed packages.

### Scroll container finding

The info-rows list uses `max-h-[420px] overflow-y-auto`. This is safe with legacy `@dnd-kit/core`: droppable rects are measured viewport-relative (`getBoundingClientRect`), so an overflow ancestor does not skew collision math. The earlier failure was Issue 1's transform conflict, not scrolling — confirmed by reproducing the bug with the scroll container removed.

## Risks / Trade-offs

**[Risk] @dnd-kit adds bundle size**
- Mitigation: Tree-shakeable, ~15KB gzipped combined. Acceptable for the UX improvement.

**[Risk] Animation performance on low-end devices**
- Mitigation: Use `will-change: transform` on animated elements. Limit simultaneous animations. Framer-motion handles this well by default.

**[Risk] Breaking existing URLs**
- Mitigation: Row numbers are display-only, not in URL encoding. No URL format changes.

**[Risk] Default behavior change affects existing users**
- Mitigation: Only affects new sessions / reset. Existing saved URLs still work. Users who liked the old defaults can manually re-add rows.

**[Trade-off] Single-column vs 2-column builder layout**
- Current: 2-column grid (`grid-cols-1 sm:grid-cols-2`)
- Drag-and-drop works best in single column
- Decision: Switch to single-column for drag-and-drop compatibility. Each row is a full-width card with number + controls on one line, value input below.

**[Trade-off] Drag handle vs full-row drag**
- Full-row drag is intuitive but conflicts with input focus (typing in a field)
- Drag handle (grip icon) is explicit and doesn't interfere with inputs
- Decision: Use drag handle on the left side of each row card
