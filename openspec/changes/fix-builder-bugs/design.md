## Context

The README builder has four bugs affecting the deployed version. The codebase uses Next.js with Cloudflare deployment, and the SVG preview endpoint fetches GitHub data server-side. The bugs span three files: `fields.ts` (color resolution), `readme-builder.tsx` (profile fetch behavior), and `route.ts` (caching).

## Goals / Non-Goals

**Goals:**
- Fix black label rendering in SVG preview
- Remove unwanted "Host" label persistence
- Prevent profile fetch from overwriting user-entered info rows
- Ensure GitHub stats update in production within reasonable time

**Non-Goals:**
- Redesigning the profile fetch UX
- Adding new stats display features
- Changing the info fields architecture

## Decisions

### 1. Color Resolution: `??` → `||`

**Decision:** Replace nullish coalescing (`??`) with logical OR (`||`) in color assignment.

**Rationale:** `??` only guards against `null`/`undefined`, passing empty strings through. SVG `fill=""` defaults to black per spec. `||` treats empty strings as falsy, triggering the fallback.

**Files:** `src/lib/fields.ts` lines 147 and 168

**Alternative considered:** Add explicit `|| ""` guard. Rejected as redundant — `||` is cleaner.

### 2. Legacy parseFields: Add `f.color` Fallback

**Decision:** Add missing `f.color` fallback in the legacy `parseFields` path (no `f` param).

**Rationale:** The modern path (`resolveRow`) has `def?.color` fallback, but the legacy path skips it. This inconsistency causes different behavior depending on URL format.

**File:** `src/lib/fields.ts` line 168

### 3. Profile Fetch: Remove `setFields()` Call

**Decision:** Remove the `setFields()` call from the `useEffect` that handles `profileQuery.data`.

**Rationale:** The current behavior overwrites user-entered info rows with GitHub profile data. Stats (repos, followers, stars) are only displayed transiently in `fetchStatus` and never persisted. The fix decouples profile fetching from info row mutation.

**File:** `src/components/readme-builder.tsx` lines 295-305

**Trade-off:** Users lose auto-population of info rows from GitHub profile. This is the desired behavior per the bug report.

### 4. Cache Headers: Reduce `s-maxage`

**Decision:** Change `s-maxage=1800` to `s-maxage=60` with `stale-while-revalidate=300`.

**Rationale:** 30-minute caching causes stale stats. 60-second caching balances freshness with GitHub API rate limits (60 req/hr unauthenticated). `stale-while-revalidate` serves fast while refreshing in background.

**File:** `src/app/api/public/readme.svg/route.ts` lines 499-507

**Alternative considered:** `no-cache`. Rejected — would hit GitHub API rate limits quickly with multiple users.

## Risks / Trade-offs

- **[Risk] Color fix might break valid empty color URLs** → Mitigation: Empty colors were already broken (rendered black), so this is strictly an improvement.
- **[Risk] Removing profile auto-fill might inconvenience users** → Mitigation: Users can still manually enter info; the fetch button now only shows status.
- **[Risk] Reduced cache might increase GitHub API calls** → Mitigation: 60-second cache still provides protection; `stale-while-revalidate` reduces perceived latency.
