# Proposal: Themed Scrollbars

## Why

The site uses native browser scrollbars everywhere, which render as chunky light-gray chrome that clashes with the dark-only Catppuccin Macchiato palette (`background #24273a`, `card #363a4f`). The two most visible offenders are the info-rows panel on `/build` and the code snippet previews (Markdown / HTML / URL), but every scroll surface is affected — including the ASCII textarea, the theme select dropdown, and the main document bar.

## What Changes

- Add site-wide scrollbar theming in `globals.css` so all scrollable surfaces share one "ghost/accent hybrid" treatment:
  - Idle thumb in the border token (`--border` #494d64), transparent track
  - Thumb brightens toward `term-green` at ~60% on hover, full `term-green` while dragging
  - Thin 8px rounded-full geometry; transparent scrollbar corner
- Set `color-scheme: dark` on `:root` so any unstyled native fallback (e.g., inside portals) renders dark
- Add Firefox-tier support via `scrollbar-width: thin` + `scrollbar-color` (colors only, no hover/drag states)
- Apply a static bottom fade mask (~24px) to the info-rows scroll viewport in `readme-builder.tsx` so cut-off rows are visually signaled before scrolling starts
- Theme the main page/document scrollbar too (falls out of global styling)

Non-goals:
- No Radix `ScrollArea` component adoption (rejected during exploration due to dnd-kit pointer-capture risk and component churn)
- No `scrollbar-gutter: stable` (can be added later if layout shift becomes noticeable)

## Capabilities

### New Capabilities

- `ui-scrollbars`: Site-wide themed scrollbar behavior for all scrollable surfaces (document, info-rows panel, snippet previews, ASCII textarea, select portal) plus the overflow affordance for the info-rows list.

### Modified Capabilities

<!-- None: no existing spec-level requirements change. The fade mask is additive
     visual affordance on the builder; info-fields behavior is untouched. -->

## Impact

- **Code**: `src/app/globals.css` (one `@layer base` block, ~20 lines); `src/components/readme-builder.tsx` (one utility class addition on the existing info-rows scroll container at line ~517)
- **Dependencies**: None added or removed
- **Risk**: Low. Pure CSS presentation change; no logic, data, or interaction changes. dnd-kit drag reordering is untouched since we keep native scrolling.
- **Browser support**: Chromium/Safari get full hybrid states; Firefox gets thin dark bars with correct colors but no hover/drag accent states (accepted degradation).
