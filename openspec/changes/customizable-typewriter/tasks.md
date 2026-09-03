## 1. BuilderState Extension

- [x] 1.1 Add `typewriter` field to `BuilderState` interface in `builder-state.ts`
- [x] 1.2 Add default typewriter state `{ phrase1: "", phrase2: "", speed: 1.0, pause: 500 }` to `readBuilderState` for empty params
- [x] 1.3 Add `tw_p1`, `tw_p2`, `tw_spd`, `tw_pau` reading in `readBuilderState`
- [x] 1.4 Add `tw_p1`, `tw_p2`, `tw_spd`, `tw_pau` writing in `buildSharedParams`

## 2. Builder UI — Typewriter Section

- [x] 2.1 Add `typewriter` state with `phrase1`, `phrase2`, `speed`, `pause` to `ReadmeBuilder` component
- [x] 2.2 Add typewriter state hydration from URL params in the existing hydration effect
- [x] 2.3 Add typewriter state to URL sync effect (debounced)
- [x] 2.4 Create typewriter section UI below info rows: two text inputs with 48-char maxlength and character counters
- [x] 2.5 Add typing speed slider (0.5x to 2.0x, step 0.1, default 1.0x) with label showing current value
- [x] 2.6 Add pause duration slider (0 to 3000ms, step 100, default 500ms) with label showing current value
- [x] 2.7 Wire typewriter state into `builderState` useMemo and `buildPreviewUrl`

## 3. SVG Route — Typewriter Refactor

- [x] 3.1 Parse `tw_p1`, `tw_p2`, `tw_spd`, `tw_pau` from request URL in `GET` handler
- [x] 3.2 Refactor `genTwCSS` to accept `(phrase1, phrase2, speed, pause)` parameters instead of using hardcoded constants
- [x] 3.3 Compute base durations from phrase lengths and speed multiplier inside `genTwCSS`
- [x] 3.4 Handle conditional keyframe generation: both empty (no animation), phrase1 only, phrase2 only, both phrases
- [x] 3.5 Conditionally emit typewriter `<g>` SVG groups based on which phrases are non-empty
- [x] 3.6 Remove hardcoded `TW_P1`, `TW_P2`, `TW_PHASE`, `TW_CYCLE_MS` constants

## 4. Integration & Polish

- [ ] 4.1 Verify builder URL serialization round-trips correctly (set values → copy URL → open → values match)
- [ ] 4.2 Verify SVG preview updates live when typewriter values change in builder
- [ ] 4.3 Verify backward compatibility: existing card URLs without `tw_*` params render no typewriter animation
