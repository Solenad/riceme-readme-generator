## Purpose

Defines site-wide scrollbar theming for the app: all scrollable surfaces use a shared dark scrollbar treatment built from theme tokens, with ghost/accent hybrid thumb states on Chromium/Safari, a thin-bar degradation tier for Firefox, a `color-scheme: dark` fallback for unstyled surfaces, and a fade signal on overflowing info rows — all purely presentational, preserving existing behavior.
## Requirements
### Requirement: Site-wide themed scrollbars
The system SHALL style all scrollable surfaces (document scrollbar, info-rows panel, snippet previews, ASCII art textarea, select dropdown portals) with a shared dark scrollbar treatment using the site's theme tokens instead of native browser chrome. The treatment SHALL be defined once in global styles and SHALL NOT require per-component styling.

#### Scenario: Document scrollbar is themed
- **WHEN** the main page overflows vertically and the document scrollbar renders
- **THEN** the scrollbar uses the themed treatment (dark thumb on transparent track), not the native light-gray chrome

#### Scenario: Snippet previews use themed horizontal scrollbar
- **WHEN** a Markdown, HTML, or direct-URL snippet `<pre>` block overflows horizontally in the builder or on the landing page
- **THEN** its horizontal scrollbar uses the themed treatment

#### Scenario: ASCII textarea uses themed vertical scrollbar
- **WHEN** the custom ASCII art textarea content exceeds its max height
- **THEN** its vertical scrollbar uses the themed treatment

#### Scenario: Select dropdown portal uses themed scrollbar
- **WHEN** the theme select list is long enough to scroll inside its portal
- **THEN** its scrollbar uses the themed treatment (via `color-scheme: dark` fallback)

### Requirement: Ghost/accent hybrid thumb states
On engines supporting full scrollbar customization (Chromium/Safari), the scrollbar thumb SHALL render in the border token color at rest (ghost state), SHALL brighten toward the term-green accent at reduced opacity on hover, and SHALL render at full term-green opacity while actively dragging.

#### Scenario: Idle thumb is ghost-styled
- **WHEN** a scroll container shows a scrollbar and the pointer is not interacting with it
- **THEN** the thumb renders in the border token color (`#494d64`) with a rounded-full shape on a transparent track

#### Scenario: Hover brightens toward accent
- **WHEN** the pointer hovers over the scrollbar thumb
- **THEN** the thumb brightens to a term-green blend at approximately 60% opacity

#### Scenario: Active drag reaches full accent
- **WHEN** the user presses and drags the scrollbar thumb
- **THEN** the thumb renders at full term-green opacity (`#a6da95`)

### Requirement: Firefox degradation tier
In browsers that only support standard scrollbar color properties (Firefox), the system SHALL apply thin scrollbars with the border token as thumb color and transparent track via `scrollbar-width: thin` and `scrollbar-color`. Absence of hover/drag states in this tier SHALL be an accepted degradation, not a defect.

#### Scenario: Firefox renders thin dark bars
- **WHEN** the page is viewed in Firefox and any surface scrolls
- **THEN** scrollbars render thin, with border-token thumb color on a transparent track

#### Scenario: No hover state expected on Firefox tier
- **WHEN** the pointer hovers over a Firefox-tier scrollbar
- **THEN** the appearance remains the static thin dark bar without error or layout change

### Requirement: Dark scheme fallback for unstyled scroll surfaces
The root document SHALL declare `color-scheme: dark` so any scrolling surface not covered by explicit styling (including third-party portals) renders dark-native chrome consistent with the palette.

#### Scenario: Unstyled portal inherits dark scheme
- **WHEN** a portal-rendered surface scrolls without explicit scrollbar styling
- **THEN** its native scrollbar renders in dark mode colors rather than light chrome

### Requirement: Info rows signal overflow before scrolling
The info-rows scroll viewport in the builder SHALL visually indicate truncated content by applying a bottom fade mask (~24px) so rows cut off at the height cap are perceived as continuing below the fold.

#### Scenario: Overflowing list shows fade
- **WHEN** the info rows exceed the viewport height cap (~420px, which occurs with default field counts)
- **THEN** the bottom edge of the list fades out over approximately 24px, signaling more content below

#### Scenario: Fade does not affect interaction
- **WHEN** the user scrolls the info-rows list or drags a row to reorder
- **THEN** all interactions behave exactly as before; the mask is purely visual and does not intercept pointer events or alter drag behavior

### Requirement: Themed scrollbars preserve existing behavior
Scrollbar theming SHALL be presentation-only: no component logic, data flow, URL serialization, or drag-and-drop behavior may change as a result of this capability.

#### Scenario: Drag reorder unaffected by scrollbar changes
- **WHEN** the user drags a row within the scrolled info-rows panel after the theming change
- **THEN** reordering completes identically to prior behavior (overlay follows cursor, siblings shift, drop commits order)

#### Scenario: No new dependencies introduced
- **WHEN** the implementation lands
- **THEN** `package.json` dependencies are unchanged from before the change
