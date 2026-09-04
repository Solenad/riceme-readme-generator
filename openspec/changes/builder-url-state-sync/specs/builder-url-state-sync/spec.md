## Purpose

Defines bidirectional URL ↔ builder state synchronization: the builder reads URL params on mount to hydrate state, and every state change syncs back to the URL via `replaceState`. The URL is the sole persistence layer — no database, no localStorage.

## ADDED Requirements

### Requirement: Builder hydrates from URL on mount
The builder SHALL read URL search params on initial mount and use them to populate all builder state (username, theme, ASCII toggle, CRT toggle, custom ASCII, fields).

#### Scenario: Open share link with full state
- **WHEN** the user navigates to `/build?username=Solenad&theme=kanagawa-wave&f=distro,host&distro=Windows+11&distro_label=Distro&distro_color=%238bd5ca&host=Solenad&host_label=Host&host_color=%23eed49f`
- **THEN** the builder displays username "Solenad", theme "kanagawa-wave", and two fields with the specified values, labels, and colors

#### Scenario: Open fresh builder with no params
- **WHEN** the user navigates to `/build` with no search params
- **THEN** the builder displays empty username, default theme (catppuccin-macchiato), and two empty default fields

#### Scenario: Open share link with partial state
- **WHEN** the user navigates to `/build?username=octocat&theme=dracula`
- **THEN** the builder displays username "octocat", theme "dracula", and default fields (since `f` param is absent)

### Requirement: Builder syncs state to URL on edit
The builder SHALL update the browser URL via `replaceState` on every state change (username, theme, fields, toggles) without triggering page navigation or scroll reset.

#### Scenario: Typing username updates URL
- **WHEN** the user types "Solenad" into the username input
- **THEN** the URL bar updates to `/build?username=Solenad` (plus any other existing params)

#### Scenario: Changing theme updates URL
- **WHEN** the user selects "kanagawa-wave" from the theme dropdown
- **THEN** the URL bar updates to include `theme=kanagawa-wave`

#### Scenario: URL sync does not trigger navigation
- **WHEN** the builder syncs state to the URL
- **THEN** the page does not reload, re-render, or scroll to top

#### Scenario: URL sync does not create history entries
- **WHEN** the builder syncs state to the URL via `replaceState`
- **THEN** the browser back button does not navigate through intermediate URL states

### Requirement: Share link opens builder prefilled
The "Copy share link" button SHALL copy a `/build?...` URL that, when opened, hydrates the builder with the exact state that was active when the link was copied.

#### Scenario: Copy share link
- **WHEN** the user clicks "Copy share link" with username "Solenad", theme "kanagawa-wave", and 3 custom fields
- **THEN** the clipboard contains `/build?username=Solenad&theme=kanagawa-wave&f=...&field1=...&field2=...&field3=...`

#### Scenario: Open share link in new tab
- **WHEN** another user opens the copied share link
- **THEN** the builder is prefilled with the exact same username, theme, and fields

#### Scenario: Edit from share link creates new state
- **WHEN** the user opens a share link, changes the username, and copies a new share link
- **THEN** the new share link reflects the edited state; the original share link still reflects the original state

### Requirement: Embed snippets use SVG API URL
The markdown, HTML, and SVG URL copy buttons SHALL generate URLs pointing to `/api/public/readme.svg?...` (not `/build?...`), encoding the same state as the share link.

#### Scenario: Copy markdown snippet
- **WHEN** the user clicks "Copy markdown" with username "Solenad" and theme "kanagawa-wave"
- **THEN** the clipboard contains `![Solenad](/api/public/readme.svg?username=Solenad&theme=kanagawa-wave&...)`

#### Scenario: Copy HTML snippet
- **WHEN** the user clicks "Copy HTML"
- **THEN** the clipboard contains `<p align="center">\n  <img src="/api/public/readme.svg?username=Solenad&..." alt="Solenad" />\n</p>`

#### Scenario: Copy direct SVG URL
- **WHEN** the user clicks "Copy SVG URL"
- **THEN** the clipboard contains `/api/public/readme.svg?username=Solenad&...`

### Requirement: URL encoding includes all state
The builder URL SHALL encode all builder state: username, theme, ASCII toggle, CRT toggle, custom ASCII (compressed), and all field data (order, values, labels, colors, visibility).

#### Scenario: ASCII toggle encoded
- **WHEN** the user disables ASCII art
- **THEN** the URL includes `ascii=0`

#### Scenario: CRT toggle encoded
- **WHEN** the user disables CRT effects
- **THEN** the URL includes `crt=0`

#### Scenario: Custom ASCII art compressed
- **WHEN** the user enters custom ASCII art
- **THEN** the URL includes `aa=<compressed>` (LZString-encoded), not the raw ASCII text

#### Scenario: Field order encoded
- **WHEN** the user has fields [distro, host, uptime] in that order
- **THEN** the URL includes `f=distro,host,uptime`

#### Scenario: Field visibility encoded
- **WHEN** the user hides the "host" field
- **THEN** the URL includes `host_hide=1`

### Requirement: URL state is ground truth when f param is present
When the URL contains an `f` param, the builder SHALL use only the URL data for field state. It SHALL NOT fall back to `DEFAULT_FIELDS` values for any field that exists in the `f` list.

#### Scenario: Field value from URL takes precedence
- **WHEN** the URL contains `f=host&host=CustomValue` and `DEFAULT_FIELDS` has `host` with value "Solenad"
- **THEN** the builder displays "CustomValue" (not "Solenad")

#### Scenario: Missing field value in URL shows empty
- **WHEN** the URL contains `f=host` but no `host=<value>` param
- **THEN** the builder displays an empty value for the host field (not the default "Solenad")

#### Scenario: Legacy URL without f param uses defaults
- **WHEN** the URL contains `host=Solenad` but no `f` param
- **THEN** the builder displays default fields with "Solenad" as the host value (legacy behavior preserved)
