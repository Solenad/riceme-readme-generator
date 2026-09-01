## Purpose

Defines the share button variants: four distinct copy buttons that generate different URL types from the same internal builder state, each optimized for a specific use case.

## ADDED Requirements

### Requirement: Share link button copies builder URL
The "Copy share link" button SHALL copy a `/build?...` URL to the clipboard that opens the builder prefilled with the current state.

#### Scenario: Copy share link
- **WHEN** the user clicks "Copy share link"
- **THEN** the clipboard contains a URL starting with `/build?` encoding the full builder state

#### Scenario: Share link toast feedback
- **WHEN** the share link is copied
- **THEN** a toast notification appears confirming "Copied to clipboard" with a preview of the URL

### Requirement: Markdown snippet button copies embed code
The "Copy markdown" button SHALL copy a markdown image embed snippet pointing to the SVG API endpoint.

#### Scenario: Copy markdown snippet
- **WHEN** the user clicks "Copy markdown"
- **THEN** the clipboard contains `![username](/api/public/readme.svg?username=...&theme=...&...)`

#### Scenario: Markdown snippet uses current username
- **WHEN** the username is "Solenad" and the user clicks "Copy markdown"
- **THEN** the alt text is "Solenad" and the URL contains `username=Solenad`

### Requirement: HTML snippet button copies centered image tag
The "Copy HTML" button SHALL copy an HTML snippet with a centered `<img>` tag pointing to the SVG API endpoint.

#### Scenario: Copy HTML snippet
- **WHEN** the user clicks "Copy HTML"
- **THEN** the clipboard contains `<p align="center">\n  <img src="/api/public/readme.svg?..." alt="username" />\n</p>`

#### Scenario: HTML snippet is GitHub-compatible
- **WHEN** the HTML snippet is pasted into a GitHub profile README
- **THEN** the image renders centered and displays the generated SVG card

### Requirement: SVG URL button copies direct image link
The "Copy SVG URL" button SHALL copy the direct SVG API URL without any markdown or HTML wrapping.

#### Scenario: Copy SVG URL
- **WHEN** the user clicks "Copy SVG URL"
- **THEN** the clipboard contains `/api/public/readme.svg?username=...&theme=...&...`

#### Scenario: SVG URL is directly accessible
- **WHEN** the copied SVG URL is pasted into a browser address bar
- **THEN** the browser displays the generated SVG card image

### Requirement: All buttons copy from same state
All four copy buttons SHALL generate their respective URLs from the same internal builder state, ensuring consistency across all output formats.

#### Scenario: All URLs encode same params
- **WHEN** the builder has username "Solenad", theme "kanagawa-wave", and 3 fields
- **THEN** all four copy buttons produce URLs containing the same username, theme, and field parameters (differing only in base path and wrapping)

#### Scenario: State change updates all buttons
- **WHEN** the user changes the theme from "catppuccin-macchiato" to "kanagawa-wave"
- **THEN** all four copy buttons immediately reflect the new theme in their generated URLs

### Requirement: Copy feedback via toast
Each copy button SHALL trigger a toast notification confirming the copy and showing a preview of the copied content.

#### Scenario: Toast shows copied confirmation
- **WHEN** any copy button is clicked
- **THEN** a toast appears with "Copied to clipboard" and a truncated preview of the copied URL

#### Scenario: Toast auto-dismisses
- **WHEN** the toast appears
- **THEN** it auto-dismisses after 2 seconds

#### Scenario: Multiple rapid copies
- **WHEN** the user clicks multiple copy buttons in quick succession
- **THEN** each click shows its own toast (toasts may stack or replace)
