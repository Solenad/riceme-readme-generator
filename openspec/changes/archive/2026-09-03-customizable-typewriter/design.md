## Context

The SVG card route (`src/app/api/public/readme.svg/route.ts`) generates a typewriter animation at the bottom of the card using hardcoded phrases (`TW_P1`, `TW_P2`) and hardcoded timing (`TW_PHASE`). The `genTwCSS()` function produces CSS `@keyframes` for three SVG groups: `tw-p1` (phrase 1), `tw-p2` (phrase 2), and `tw-cempty` (cursor-only). The animation uses `clip-path` to reveal text character-by-character.

The builder UI (`src/components/readme-builder.tsx`) has no typewriter controls. `BuilderState` (`src/lib/builder-state.ts`) has no typewriter fields. URL params carry nothing for typewriter configuration.

## Goals / Non-Goals

**Goals:**
- Let users set two custom phrases (max 48 chars each) for the typewriter animation
- Let users control typing speed via a multiplier (0.5x to 2.0x)
- Let users control pause duration between phrases (0ms to 3000ms)
- Default to blank phrases (no animation until user enters text)
- Conditionally render typewriter SVG groups only when phrases are provided
- Keep URL params simple and uncompressed (phrases are short)

**Non-Goals:**
- Variable number of phrases (fixed at 2)
- Per-character speed variation
- Typing sound effects
- Cursor style customization

## Decisions

### 1. Speed as multiplier, not ms-per-char

**Decision:** Use a multiplier (0.5x to 2.0x) that scales all base durations proportionally.

**Why:** A multiplier is intuitive — "1x" is normal, "2x" is faster. It scales both typing and hold durations together, keeping the animation feel consistent. ms-per-char would require users to understand the relationship between character count and total duration.

**Base durations (at 1x):**
- Type: `phrase.length × 80ms`
- Hold: `1500ms` (phrase 1), `3000ms` (phrase 2)
- Delete: `phrase.length × 50ms`
- Empty hold: `500ms`

**Effective duration:** `baseMs × (1 / speed)`

### 2. Pause as separate parameter

**Decision:** Expose pause-between-phases as an independent slider (0–3000ms).

**Why:** Pause is orthogonal to speed. A user might want fast typing but a long dramatic pause, or slow typing with no pause. Coupling them limits expressiveness.

### 3. Conditional SVG emission

**Decision:** Only emit typewriter `<g>` groups when at least one phrase is non-empty. When both are empty, omit all typewriter elements and the `genTwCSS()` call.

**Why:** Avoids rendering invisible elements and prevents the empty cursor from blinking when there's nothing to type.

**Phrase coverage:**
- Both empty → no typewriter rendered
- Phrase1 only → type-hold-delete phrase1, no phrase2
- Phrase2 only → skip to typing phrase2
- Both phrases → full sequence with pause between

### 4. Character limit: 48 chars

**Decision:** Cap each phrase at 48 characters.

**Why:** At font-size 13 monospace, ~8px/char, with a 65px prompt prefix on a 900px card, ~104 chars fit. 48 chars keeps text well within bounds even with the cursor, and provides a clean UX constraint.

### 5. BuilderState extension

**Decision:** Add a `typewriter` object to `BuilderState`:

```typescript
typewriter: {
  phrase1: string;   // max 48 chars
  phrase2: string;   // max 48 chars
  speed: number;     // 0.5 to 2.0
  pause: number;     // 0 to 3000 ms
}
```

**Why:** Groups related config together. Clean serialization to 4 URL params (`tw_p1`, `tw_p2`, `tw_spd`, `tw_pau`).

### 6. URL params — no compression

**Decision:** Use plain URL params without LZ compression.

**Why:** 48 chars × 2 phrases + 2 numeric params is well under URL length limits. Compression adds complexity and obscures the URL for debugging.

## Risks / Trade-offs

- **URL length** → Phrases at 48 chars each add ~100 chars to the URL. Combined with existing params, total URL stays under 2KB. Mitigation: strict 48-char enforcement in the UI.
- **Animation timing drift** → CSS `step-end` keyframes are frame-accurate. No drift risk.
- **Backward compatibility** → Existing card URLs without `tw_*` params will render no typewriter animation (blank defaults). This is a change from the current hardcoded animation. Mitigation: set the builder defaults to blank, so new builds match old URLs that lack the params.
- **genTwCSS complexity** → Dynamic phrase lengths mean the keyframe generator must handle variable stop counts. Mitigation: the function already loops over character counts; just parameterize the inputs.
