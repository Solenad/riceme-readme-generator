## 1. Fix Color Resolution in fields.ts

- [x] 1.1 Replace `??` with `||` in `resolveRow` color assignment (line 147)
- [x] 1.2 Replace `??` with `||` in `parseFields` legacy path color assignment (line 168)
- [x] 1.3 Add missing `f.color` fallback in `parseFields` legacy path

## 2. Fix Profile Fetch Behavior in readme-builder.tsx

- [x] 2.1 Remove `setFields()` call from the `useEffect` that handles `profileQuery.data` (lines 295-305)
- [x] 2.2 Keep the `toast.success()` call for fetch feedback

## 3. Fix Cache Headers in route.ts

- [x] 3.1 Change `s-maxage=1800` to `s-maxage=60` in the SVG route cache headers (line 504)
- [x] 3.2 Add `stale-while-revalidate=300` to the cache control header

## 4. Verification

- [x] 4.1 Run `npm run build` to verify no type errors
- [ ] 4.2 Test color resolution with empty color strings in URL
- [ ] 4.3 Test profile fetch does not overwrite info rows
- [ ] 4.4 Verify cache headers in production build
