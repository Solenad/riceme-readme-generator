## Why

The README builder has four bugs affecting the deployed version at riceme.roedzn.tech: info row labels render black due to empty color resolution, the "Host" label persists when it shouldn't, profile fetching overwrites user-entered info rows instead of only updating stats, and GitHub stats are stale in production due to aggressive CDN caching.

## What Changes

- Fix color resolution in `parseFields` and `resolveRow` to handle empty strings (replace `??` with `||`)
- Add missing `f.color` fallback in the legacy `parseFields` path
- Remove `setFields()` from the profile fetch `useEffect` so fetching only updates stats, not info rows
- Reduce `s-maxage` in SVG route cache headers to fix stale stats in production

## Capabilities

### New Capabilities

None — all changes are bug fixes to existing capabilities.

### Modified Capabilities

- `info-fields`: Fix color resolution to handle empty string values, preventing black labels in SVG rendering
- `builder-preview-modal`: No spec changes needed (caching fix is infrastructure-level)

## Impact

- **Code**: `src/lib/fields.ts` (color resolution), `src/components/readme-builder.tsx` (profile fetch behavior), `src/app/api/public/readme.svg/route.ts` (cache headers)
- **Deployed site**: Stats will update faster, colors will render correctly
- **Breaking changes**: None
