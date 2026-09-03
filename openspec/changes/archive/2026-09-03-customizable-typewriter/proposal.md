## Why

The typewriter animation at the bottom of the generated SVG card is hardcoded to two fixed phrases with fixed timing. Users cannot customize the text, typing speed, or pause duration. This limits personalization — the core value proposition of the tool.

## What Changes

- Add a "Typewriter" section to the builder UI with two phrase inputs (max 48 chars each), a typing speed slider, and a pause-between-phrases slider.
- Extend `BuilderState` with `typewriter: { phrase1, phrase2, speed, pause }`.
- Add URL params `tw_p1`, `tw_p2`, `tw_spd`, `tw_pau` for SVG serialization.
- Refactor `genTwCSS` in the SVG route to accept dynamic phrases and compute animation durations from speed multiplier.
- Conditionally render typewriter SVG groups based on whether phrases are provided.
- Default to blank phrases (no animation until user enters text).

## Capabilities

### New Capabilities

- `typewriter-customization`: Builder UI controls and SVG rendering for user-customizable typewriter phrases, typing speed, and inter-phrase pause.

### Modified Capabilities

## Impact

- `src/lib/builder-state.ts` — extend `BuilderState`, add `tw_*` param read/write
- `src/components/readme-builder.tsx` — add typewriter UI section (2 text inputs, 2 sliders)
- `src/app/api/public/readme.svg/route.ts` — parse `tw_*` params, refactor `genTwCSS` for dynamic phrases and speed, conditionally emit typewriter SVG groups
