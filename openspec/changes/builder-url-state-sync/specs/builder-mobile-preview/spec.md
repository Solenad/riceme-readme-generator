## Purpose

Defines the mobile responsive behavior: on viewports below the `lg` breakpoint (1024px), the SVG preview panel sticks to the top of the viewport while the form scrolls below, with a collapsible toggle to maximize form space.

## Requirements

### Requirement: Sticky preview on mobile
On viewports below `lg` (1024px), the SVG preview container SHALL use `position: sticky; top: 0; z-index: 10` to remain visible while the user scrolls the form.

#### Scenario: Preview sticks on scroll
- **WHEN** the user scrolls down on a mobile viewport (< 1024px)
- **THEN** the SVG preview remains visible at the top of the viewport while form fields scroll beneath it

#### Scenario: Preview does not overlap header
- **WHEN** the preview is sticky
- **THEN** it does not overlap the page header or navigation (z-index below header)

#### Scenario: Desktop layout unchanged
- **WHEN** the viewport is `lg` (1024px) or wider
- **THEN** the builder uses the existing two-column grid layout (form left, preview right)

### Requirement: Preview height cap on mobile
On mobile viewports, the sticky preview SHALL have a maximum height of 40vh to avoid dominating the screen.

#### Scenario: Preview respects height cap
- **WHEN** the SVG card is taller than 40vh
- **THEN** the preview container clips the card at 40vh with `overflow: hidden`

#### Scenario: Short cards use natural height
- **WHEN** the SVG card is shorter than 40vh
- **THEN** the preview container uses the card's natural height

### Requirement: Collapsible preview toggle
The mobile preview SHALL include a chevron toggle button that allows the user to collapse the preview to a 60px thumbnail strip or expand it to full height.

#### Scenario: Click chevron to collapse
- **WHEN** the user clicks the chevron-down icon on the mobile preview
- **THEN** the preview animates to 60px height, showing only a thin thumbnail of the SVG

#### Scenario: Click chevron to expand
- **WHEN** the user clicks the chevron-up icon on the collapsed preview
- **THEN** the preview animates back to full height (up to 40vh)

#### Scenario: Collapse animation
- **WHEN** the preview collapses or expands
- **THEN** the height transition animates smoothly over 300ms

#### Scenario: Collapsed state persists during session
- **WHEN** the user collapses the preview and scrolls to edit fields
- **THEN** the preview remains collapsed until the user explicitly expands it

### Requirement: Preview does not interfere with form interactions
The sticky mobile preview SHALL NOT block or interfere with form interactions below it.

#### Scenario: Scrolling past preview
- **WHEN** the user scrolls on the form area below the sticky preview
- **THEN** the form scrolls normally while the preview remains fixed

#### Scenario: Dropdown portals render above preview
- **WHEN** the user opens the theme dropdown on mobile
- **THEN** the dropdown portal renders above the sticky preview (z-index > 10)

#### Scenario: Drag-and-drop works below preview
- **WHEN** the user drags a field row below the sticky preview
- **THEN** the drag overlay follows the cursor without being clipped by the preview container

### Requirement: Mobile layout stacks vertically
On mobile viewports, the builder SHALL use a single-column layout with the preview at the top and the form below.

#### Scenario: Single column on mobile
- **WHEN** the viewport is below `lg` (1024px)
- **THEN** the builder displays as a single vertical column (not the two-column grid)

#### Scenario: Form sections stack vertically
- **WHEN** the builder is in mobile layout
- **THEN** the username input, theme selector, toggles, and field rows stack vertically in order

#### Scenario: Snippets at bottom
- **WHEN** the builder is in mobile layout
- **THEN** the copy buttons (share link, markdown, HTML, SVG URL) appear at the bottom of the form, below all fields
