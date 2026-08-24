## Why

The builder currently generates share URLs but never reads them back. There's no way to recreate a previous card configuration without manually re-entering all fields. This defeats the purpose of URL-based state — users can't share editable configurations, and there's no "save" mechanism beyond copy-pasting the embed snippet. Additionally, the builder lacks input validation and has poor mobile usability.

## What Changes

- **URL state read/write**: Builder reads URL params on mount to hydrate state; every edit syncs back to the URL via `replaceState`
- **Share button variants**: Four copy buttons — share link (`/build?...`), markdown snippet, HTML snippet, and direct SVG URL — each generating the correct URL type for its use case
- **Username validation**: GitHub username input validates format (`^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$`) and blocks the Fetch button when invalid; inline feedback shows profile fetch status
- **Field validation**: Duplicate label detection with warning; character count indicator for values approaching wrap limit
- **Mobile sticky preview**: On screens < `lg`, the SVG preview sticks to the top of the viewport while the form scrolls; collapsible via chevron toggle
- **Versioning guardrail**: When `f` param is present in URL, `resolveRow` no longer falls back to `DEFAULT_FIELDS` values — the URL is the complete ground truth

## Capabilities

### New Capabilities
- `builder-url-state-sync`: Bidirectional URL ↔ builder state synchronization. Covers reading URL params on mount, writing state to URL on edit, and the `readBuilderState`/`writeToBuildUrl` functions.
- `builder-share-buttons`: Multiple share link variants (share link, markdown, HTML, SVG URL) with clipboard copy and toast feedback.
- `builder-validation`: Username format validation with fetch blocking; field-level duplicate label warnings and character count indicators.
- `builder-mobile-preview`: Sticky preview panel on mobile viewports with collapse/expand toggle.

### Modified Capabilities
- `info-fields`: Modify "Legacy card URLs remain valid" requirement — when `f` param is present, `resolveRow` SHALL NOT fall back to `DEFAULT_FIELDS` values. The URL is the ground truth. Legacy URLs without `f` param continue to use defaults (unchanged).

## Impact

- **Components**: `readme-builder.tsx` (major refactor), new `builder-state.ts`, `builder-share.tsx`, `builder-validation.tsx`
- **Lib**: `fields.ts` (`resolveRow` fallback behavior change)
- **Hooks**: New `use-url-sync.ts` hook
- **Pages**: `build/page.tsx` (minor — pass searchParams to builder)
- **API**: No changes to SVG route — it already handles all params correctly
- **Dependencies**: No new packages — `lz-string`, `sonner`, `cmdk` already installed
- **Breaking changes**: None — existing embed URLs (`/api/public/readme.svg?...`) are unaffected. Existing share URLs that lack the `f` param continue to work via legacy fallback.
