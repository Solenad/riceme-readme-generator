## 1. URL State Management Core

- [ ] 1.1 Create `src/lib/builder-state.ts` with `readBuilderState(params: URLSearchParams)` function that extracts username, theme, ascii, crt, customAscii, and fields from URL params
- [ ] 1.2 Add `writeToBuildUrl(state: BuilderState)` function that serializes builder state to `/build?...` URL params
- [ ] 1.3 Add `writeToSvgUrl(state: BuilderState)` function that serializes builder state to `/api/public/readme.svg?...` URL params
- [ ] 1.4 Modify `resolveRow` in `src/lib/fields.ts` to accept a `hasExplicitFields` boolean — when true, skip `DEFAULT_FIELDS` fallback for values

## 2. Builder URL Sync

- [ ] 2.1 Add `useSearchParams` and `useRouter` imports to `readme-builder.tsx`
- [ ] 2.2 On mount, call `readBuilderState(searchParams)` to hydrate all state from URL (username, theme, ascii, crt, customAscii, fields)
- [ ] 2.3 Create `useEffect` that calls `syncUrl()` on every state change, using `router.replace(url, { scroll: false })` to update URL bar without navigation
- [ ] 2.4 Debounce URL sync to 300ms to avoid excessive `replaceState` calls during rapid typing
- [ ] 2.5 Handle edge case: when URL has no params at all, use `resetFieldsToDefaults()` (fresh builder)

## 3. Share Buttons

- [ ] 3.1 Create `src/components/builder-share.tsx` with four copy buttons: share link, markdown, HTML, SVG URL
- [ ] 3.2 Implement `copyShareLink()` that copies `/build?...` URL from `writeToBuildUrl()`
- [ ] 3.3 Implement `copyMarkdown()` that copies `![username](/api/public/readme.svg?...)` from `writeToSvgUrl()`
- [ ] 3.4 Implement `copyHtml()` that copies `<p align="center">\n  <img src="..." alt="username" />\n</p>`
- [ ] 3.5 Implement `copySvgUrl()` that copies direct `/api/public/readme.svg?...` URL
- [ ] 3.6 Add toast feedback for each copy action using `sonner` — show "Copied to clipboard" with truncated URL preview
- [ ] 3.7 Replace existing snippet section in `readme-builder.tsx` with `<BuilderShare>` component

## 4. Username Validation

- [ ] 4.1 Add `isValidUsername(username: string): boolean` function to `builder-state.ts` using regex `^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$`
- [ ] 4.2 Add `usernameError` computed state in `readme-builder.tsx` — returns null when valid/empty, error message when invalid
- [ ] 4.3 Disable Fetch button when `usernameError` is not null or username is empty
- [ ] 4.4 Add inline error hint below username input — red-bordered text with validation message
- [ ] 4.5 Add inline success/error status after profile fetch — green checkmark with summary, red X with error, yellow warning for rate limit
- [ ] 4.6 Clear fetch status when username changes

## 5. Field Validation

- [ ] 5.1 Add `findDuplicateLabels(fields: InfoField[]): Map<string, number>` function that returns labels appearing more than once (case-insensitive, excluding empty labels)
- [ ] 5.2 Add duplicate label warning icon + "appears N times" text next to each duplicate field in `SortableRow`
- [ ] 5.3 Add character count indicator for field values — show "N/64" when value exceeds 48 chars, turn yellow at 64+
- [ ] 5.4 Add field count color coding — muted below 14, yellow at 14-15, red at 16

## 6. Mobile Sticky Preview

- [ ] 6.1 Add `collapsible` state to `readme-builder.tsx` (default: expanded)
- [ ] 6.2 Wrap preview `<img>` container with sticky CSS classes — `sticky top-0 z-10 max-h-[40vh] overflow-hidden` on mobile, normal on desktop
- [ ] 6.3 Add chevron toggle button (Lucide `ChevronDown`/`ChevronUp`) at top-right of preview container
- [ ] 6.4 Implement collapse animation — `transition-all duration-300` with `max-h-[60px]` when collapsed
- [ ] 6.5 Change builder grid from `lg:grid-cols-2` to responsive: single column on mobile, two columns on desktop
- [ ] 6.6 Move snippet/share section below fields on mobile (ensure proper ordering in single-column layout)

## 7. Integration & Testing

- [ ] 7.1 Test: open `/build` with no params — verify fresh builder with defaults
- [ ] 7.2 Test: open `/build?username=octocat&theme=dracula` — verify state hydrated correctly
- [ ] 7.3 Test: type in builder — verify URL bar updates in real time
- [ ] 7.4 Test: copy share link, open in new tab — verify builder prefilled with same state
- [ ] 7.5 Test: copy markdown snippet — verify it points to `/api/public/readme.svg` with correct params
- [ ] 7.6 Test: type invalid username — verify Fetch button disabled, error hint shown
- [ ] 7.7 Test: add two fields with same label — verify duplicate warning appears
- [ ] 7.8 Test: resize to mobile viewport — verify sticky preview, collapsible toggle, single-column layout
- [ ] 7.9 Test: open legacy URL without `f` param — verify default fields with value overrides work
