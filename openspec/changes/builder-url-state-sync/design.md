## Context

RiceMe is a terminal-style SVG card generator for GitHub READMEs. The builder page (`/build`) lets users customize cards and generates embed snippets. Currently, the builder:

1. Initializes with hardcoded defaults on every load
2. Generates URLs for embedding but never reads them back
3. Has no input validation (any string accepted as GitHub username)
4. Has no mobile-specific layout (just `lg:grid-cols-2`)

The SVG API endpoint (`/api/public/readme.svg`) already handles all URL params correctly — it's stateless and renders any valid param set. The gap is entirely in the builder's state management.

## Goals / Non-Goals

**Goals:**
- URL is the source of truth — every builder state maps 1:1 to a URL
- Share links open the builder prefilled; embed snippets render the SVG
- Users can iterate: open share link → edit → copy new share link
- Invalid usernames are blocked before fetch
- Mobile users get a usable preview without losing form access

**Non-Goals:**
- Server-side state storage (no database, no sessions)
- History/undo system (each URL is an independent snapshot)
- Social sharing integration (just copy buttons)
- Template/preset system (future work, not this change)
- Changing the SVG API endpoint (it already works correctly)

## Decisions

### 1. URL as the sole persistence layer

**Decision**: All builder state is encoded in URL query params. No localStorage, no cookies, no server state.

**Rationale**: The SVG API already uses URL params. The builder generates these same params. Unifying them means one encoding/decoding path. URLs are portable (copy-paste anywhere), debuggable (humans can read them), and require zero infrastructure.

**Alternatives considered**:
- `localStorage` + share link: Adds sync complexity, doesn't work across devices, requires a "load from storage" flow
- Server-side sessions: Adds infrastructure, breaks the stateless model, requires auth for "my saved cards"
- Compressed state blob (`?state=<lz>`): Opaque, can't debug, can't manually edit, breaks if schema changes

**Trade-off**: URLs can get long (~1200 chars for 13 fields). Acceptable for clipboard sharing; wraps in chat but still works.

### 2. Bidirectional sync via `useSearchParams` + `replaceState`

**Decision**: On mount, read `useSearchParams()` to hydrate state. On every state change, call `router.replace(url, { scroll: false })` to update the URL bar without navigation or scroll reset.

**Rationale**: Next.js `useSearchParams` gives us access to URL params. `router.replace` updates the URL without triggering re-renders or page navigation. `{ scroll: false }` prevents the page from jumping to top on URL change.

**Alternatives considered**:
- `window.history.replaceState` directly: Bypasses Next.js router, could cause hydration mismatches
- `pushState` instead of `replaceState`: Creates browser history entries for every keystroke — back button becomes unusable
- Debounced URL sync: Adds latency between state change and URL update; unnecessary since `replaceState` is synchronous

### 3. Conditional default fallback in `resolveRow`

**Decision**: When the `f` param is present, `resolveRow` uses empty strings as defaults (not `DEFAULT_FIELDS` values). When `f` is absent (legacy URLs), behavior is unchanged.

**Rationale**: The `f` param signals "this is a complete state snapshot." If a field exists in `f`, its data must be fully encoded. Falling back to defaults could inject stale or incorrect content that doesn't match what the user created.

**Implementation**: Add a `hasExplicitFields` boolean to `parseFields`. When true, `resolveRow` skips `DEFAULT_FIELDS` lookup:

```typescript
function resolveRow(id, params, palette, index, hasExplicitFields) {
  const def = hasExplicitFields ? undefined : DEFAULT_FIELDS.find(f => f.id === id);
  const value = params.get(id) ?? def?.value ?? "";
  const label = params.get(`${id}_label`) ?? def?.label ?? id;
  const color = params.get(`${id}_color`) ?? def?.color ?? palette[index % palette.length];
  return { id, label, value, color, visible: params.get(`${id}_hide`) !== "1" };
}
```

### 4. Share button variants with distinct URL targets

**Decision**: Four copy buttons, each generating a different URL type from the same internal state:

| Button | URL Pattern | Purpose |
|--------|-------------|---------|
| Copy share link | `/build?...` | Open builder prefilled |
| Copy markdown | `![user](/api/public/readme.svg?...)` | Embed in README.md |
| Copy HTML | `<img src="/api/public/readme.svg?...">` | GitHub profile HTML |
| Copy SVG URL | `/api/public/readme.svg?...` | Direct image link |

**Rationale**: Different use cases need different URLs. The share link and embed URLs encode the same state but point to different endpoints. Generating both from the same state ensures consistency.

### 5. Client-side username validation with regex

**Decision**: Validate username format client-side before enabling the Fetch button. Regex: `^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$`

**Rationale**: GitHub's username rules are well-documented and simple. Client-side validation prevents unnecessary API calls and gives instant feedback. The regex catches obvious typos (spaces, special characters) before the user clicks Fetch.

**Not validated client-side**: Whether the username actually exists on GitHub. That requires an API call (handled by the existing `useQuery` + toast error flow).

### 6. Mobile sticky preview with CSS `position: sticky`

**Decision**: On viewports < `lg` (1024px), the preview container gets `position: sticky; top: 0; z-index: 10;` with `max-height: 40vh`. A chevron button toggles between expanded and collapsed (60px thumbnail) states.

**Rationale**: CSS sticky is performant (compositor-level), requires no JavaScript scroll listeners, and degrades gracefully. The 40vh cap ensures the preview doesn't dominate the screen. Collapsed state gives more form space when the user is focused on editing.

**Alternatives considered**:
- Fixed preview: Always visible but wastes space; can overlap form content
- Floating preview (drag): Complex, conflicts with field drag-and-drop
- Separate preview page: Breaks the live-preview flow

## Risks / Trade-offs

- **URL length with many fields** → Acceptable for clipboard. If it becomes a problem, a "compact mode" could omit empty fields from the URL. Not needed now.
- **`replaceState` on every keystroke** → Could cause performance issues on low-end devices. Mitigation: debounce URL sync to 300ms (same as existing field debouncing).
- **Mobile sticky preview z-index conflicts** → The preview could overlap dropdowns or modals. Mitigation: use `z-index: 10` (below modals at 50+) and test with theme selector dropdown.
- **Legacy URL behavior change** → Old URLs without `f` param still work, but URLs with `f` param no longer fall back to defaults. This is intentional but could surprise someone who manually edited a URL and removed a field's value. Mitigation: document that `f` param means "complete state."
- **Validation regex doesn't match GitHub's exact rules** → GitHub allows some edge cases (single character usernames). The regex is conservative but correct for 99% of cases. If needed, the API call provides the ultimate validation.

## Migration Plan

No migration needed. This is purely additive:

1. Deploy the new builder with URL sync
2. Existing embed URLs (`/api/public/readme.svg?...`) continue to work unchanged
3. Existing `/build` URLs (no params) load with defaults — same as before
4. New share URLs include `f` param and all field data — fully self-contained

Rollback: Revert the commit. No data to migrate, no state to clean up.
