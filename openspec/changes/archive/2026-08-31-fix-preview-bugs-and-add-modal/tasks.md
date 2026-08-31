## 1. SVG Route — Fix empty row rendering

- [x] 1.1 In `route.ts`, filter out rows with both empty label AND empty value from `renderedInfo` *before* the height accumulation loop, so they allocate zero vertical space
- [x] 1.2 Remove the `!hasLabel && !hasValue` branch from the render loop (it's now unreachable after filtering)
- [x] 1.3 Remove the empty trailing `<text>` element at line 448-449
- [x] 1.4 Fix the header fallback at line 405 to handle empty host value gracefully (fall back to `username` variable which already has a `"your-username"` default)

## 2. Builder Component — Fix preview cache staleness

- [x] 2.1 Add `key={previewUrl}` to the `<img>` element in `readme-builder.tsx` (line 588) so React fully remounts the image when the URL changes

## 3. Builder Component — Add preview modal

- [x] 3.1 Add `previewModalOpen` boolean state to `ReadmeBuilder`
- [x] 3.2 Wrap the preview `<img>` container in a `group` div with `cursor-pointer` class
- [x] 3.3 Add hover overlay: blur the image (`backdrop-blur-sm` via group-hover) and show `[ Click ]` text centered over the image
- [x] 3.4 On click, set `previewModalOpen` to `true`
- [x] 3.5 Render a `<dialog>` element controlled by `previewModalOpen`, using `showModal()`/`close()` with `useEffect`
- [x] 3.6 Style the dialog with theme tokens (bg-card, border-border, rounded-lg, max-w-4xl)
- [x] 3.7 Inside the dialog, render the same SVG `<img>` at full natural width
- [x] 3.8 Close dialog on Escape (native `<dialog>` behavior) and on backdrop click (via `click` event on dialog element checking `e.target === e.currentTarget`)
- [x] 3.9 On dialog close, set `previewModalOpen` to `false`

## 4. Verify & polish

- [x] 4.1 Verify empty rows produce no visible output in the preview SVG
- [x] 4.2 Verify color changes reliably reflect in the preview after debounce
- [x] 4.3 Verify the preview modal opens on click and closes on Escape/backdrop
- [x] 4.4 Verify the modal shows the same SVG as the inline preview
- [x] 4.5 Run `npm run build` to confirm no type errors
