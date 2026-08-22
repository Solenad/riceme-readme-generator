## 1. Dependencies

- [x] 1.1 Install `@dnd-kit/core` and `@dnd-kit/sortable` packages
- [x] 1.2 Run `npm audit` to verify no security advisories

## 2. Fields library

- [x] 2.1 Update `resetFieldsToDefaults()` to return 2 rows with empty label/value (IDs: "distro", "host")
- [x] 2.2 Update `addRowToFields()` to produce empty label and value (not slug as label)
- [x] 2.3 Add `placeholder: "Value"` to default row shape in `InfoField` interface
- [x] 2.4 Update existing tests in `fields.test.ts` for new default behavior
- [x] 2.5 Add test: reset returns 2 rows with empty label/value
- [x] 2.6 Add test: addRow produces empty label/value

## 3. SVG route - row numbering

- [x] 3.1 Add row index (1-based, zero-padded) to each rendered row
- [x] 3.2 Add fixed-width number column (20px) before label column
- [x] 3.3 Style number text: font-size 10, theme.muted color, monospace
- [x] 3.4 Shift label column start by 25px (20px number + 5px gap)
- [x] 3.5 Shift value column start accordingly
- [x] 3.6 Handle empty label + empty value: render number only
- [x] 3.7 Handle empty label + non-empty value: render value at label position
- [x] 3.8 Verify legacy URLs (no `f=`) still render correctly with numbering

## 4. Builder - row numbering

- [x] 4.1 Add two-digit index display before each row card
- [x] 4.2 Style index: monospace, muted color, right-aligned in fixed-width container
- [x] 4.3 Verify indices update on add/remove/reorder

## 5. Builder - drag-and-drop

- [x] 5.1 Wrap row grid in `DndContext` from `@dnd-kit/core`
- [x] 5.2 Wrap rows in `SortableContext` with `verticalListSortingStrategy`
- [x] 5.3 Add `useSortable` hook to each row card
- [x] 5.4 Add drag handle (grip icon) to left side of row card
- [x] 5.5 Implement `onDragEnd` handler to call `moveRowInFields`
- [x] 5.6 Remove up/down arrow buttons (replaced by drag-and-drop)
- [x] 5.7 Ensure keyboard accessibility (DndContext provides this by default)

## 6. Builder - animation

- [x] 6.1 Add `layout` prop to row motion.div for smooth reorder animation
- [x] 6.2 Wrap row list in `AnimatePresence` for add/remove animations
- [x] 6.3 Add `initial`/`animate`/`exit` props for fade-in + slide-down on add
- [x] 6.4 Test animation performance (no jank on add/remove/reorder)

## 7. Builder - layout adjustment

- [x] 7.1 Switch from 2-column grid to single-column layout for drag-and-drop compatibility
- [x] 7.2 Each row card: number + color picker + label input + controls on first line
- [x] 7.3 Value input on second line (full width)
- [x] 7.4 Verify responsive behavior on mobile widths

## 8. Verification

- [x] 8.1 Run lint + typecheck + production build clean
- [x] 8.2 Verify legacy URL (no `f=`) renders identically to pre-change output (byte-for-byte)
- [x] 8.3 Verify new URL with `f=` renders with row numbers
- [x] 8.4 Manual QA: reset produces 2 empty rows, add row produces empty row
- [x] 8.5 Manual QA: drag-and-drop reorders rows, animation smooth
- [x] 8.6 Manual QA: row numbers update correctly on add/remove/reorder
- [x] 8.7 Manual QA: empty rows render number only in SVG

## 9. Post-QA fixes

- [x] 9.1 Fix drop-above/between failure: remove framer-motion `layout`/`y` from sortable rows (transform ownership conflict with @dnd-kit); plain div owns dnd-kit transform, opacity-only inner motion.div
- [x] 9.2 Set collision detection to `closestCenter`; single drag handle via `setActivatorNodeRef` + `touch-none`
- [x] 9.3 Remove `AnimatePresence mode="popLayout"`; add `onDragCancel` to clear overlay state
- [x] 9.4 Re-verify drag up/down/between + scroll container (`max-h` + `overflow-y-auto`) works together; typecheck + build clean
