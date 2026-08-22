## Purpose

Defines the info section of the generated README card: an ordered, user-configurable list of up to 16 rows with editable labels, per-row colors, visibility control, drag-and-drop reordering, two-digit index display, and URL encoding that stays backward-compatible with legacy card URLs.
## Requirements
### Requirement: Info rows are configurable fields
The system SHALL model the info section of the generated card as an ordered list of up to 16 user-configurable rows. Each row SHALL have an id, a label, a value, a color, and a visible state. Users SHALL be able to add and delete rows while the row count is within the limit.

#### Scenario: Add row under the limit
- **WHEN** the current row count is below 16 and the user clicks "Add row"
- **THEN** a new empty row is appended with a generated id, a default label, a default color, and visible state

#### Scenario: Add row blocked at the limit
- **WHEN** the row count is 16 and the user attempts to add a row
- **THEN** the add control is disabled and no row is added

#### Scenario: Delete a row
- **WHEN** the user deletes a row
- **THEN** the row is removed and the remaining rows keep their relative order

#### Scenario: Card renders at most 16 rows
- **WHEN** a card URL contains more than 16 rows
- **THEN** the SVG renders only the first 16 rows

### Requirement: Row labels are editable
The system SHALL allow users to edit the label of any row, and the generated card SHALL render the label text rather than the raw id.

#### Scenario: Rename a label
- **WHEN** the user changes the label of the row with id "distro" to "OS"
- **THEN** the generated card renders "OS" as the row's label and the card URL contains `distro_label=OS`

#### Scenario: Empty label falls back to the id
- **WHEN** the user clears a row's label
- **THEN** the generated card renders the row's id as the label

### Requirement: Row colors are customizable
The system SHALL allow users to set a color per row, rendered as the label text color in the SVG and the dot indicator in the builder.

#### Scenario: Set a custom color
- **WHEN** the user picks a color for a row
- **THEN** the generated card renders the row's label in that color and the card URL contains the row's color parameter

#### Scenario: Row without a color override
- **WHEN** a card URL has no explicit color for a row
- **THEN** the SVG assigns the theme palette color by row index (existing behavior)

### Requirement: Rows can be reordered
The system SHALL allow users to reorder rows by dragging a row's handle; reordering SHALL also be operable via keyboard. The generated card SHALL render rows in the user's order with a two-digit index prefix.

#### Scenario: Drag-and-drop reorder
- **WHEN** the user drags a row by its handle and releases over another position
- **THEN** the row moves to the target position and the card URL reflects the new order

#### Scenario: Dragged row visual feedback
- **WHEN** the user grabs a row's handle and holds
- **THEN** the source row disappears from the list while an overlay replica of the row follows the cursor

#### Scenario: Sibling rows make space during drag
- **WHEN** the dragged overlay hovers between two rows
- **THEN** sibling rows smoothly shift apart to indicate the pending drop position

#### Scenario: Drop commits order permanently
- **WHEN** the user releases the dragged row over a valid position
- **THEN** the overlay disappears, the row settles into the target slot, and remaining rows re-index sequentially

#### Scenario: Drag cancellation restores state
- **WHEN** the user presses Escape or the drag is otherwise cancelled mid-flight
- **THEN** the overlay disappears and every row returns to its pre-drag position

#### Scenario: Rows animate on reorder
- **WHEN** a row is reordered (via drag-and-drop or keyboard)
- **THEN** all affected rows smoothly animate to their new positions

#### Scenario: Boundaries
- **WHEN** the user attempts to move the first row up or the last row down
- **THEN** the order is unchanged

### Requirement: Rows can be hidden
The system SHALL allow users to hide individual rows; hidden rows SHALL NOT render on the generated card but SHALL retain their data.

#### Scenario: Hide a row
- **WHEN** the user hides a row that has a value
- **THEN** the row does not render on the generated card and the card URL contains the row's hide parameter

#### Scenario: Unhide a row
- **WHEN** the user unhides a previously hidden row
- **THEN** the row renders on the generated card again

### Requirement: Rows can be duplicated and reset
The system SHALL allow users to duplicate a row and to reset all rows to the default set.

#### Scenario: Duplicate a row
- **WHEN** the user duplicates a row
- **THEN** a new row with the same label, value, and color is appended with a unique id

#### Scenario: Reset to defaults
- **WHEN** the user clicks "Reset"
- **THEN** the rows are restored to 2 empty rows with empty labels and values, visible, using the first two palette colors

#### Scenario: New row defaults
- **WHEN** the user adds a new row
- **THEN** the row has an empty label, empty value, the next palette color, and visible state

#### Scenario: Empty row placeholders
- **WHEN** a row has an empty label
- **THEN** the builder input shows "Label" as placeholder text

#### Scenario: Empty value placeholders
- **WHEN** a row has an empty value
- **THEN** the builder input shows "Value" as placeholder text

### Requirement: Card URL encodes info rows
The card URL SHALL encode the ordered rows with an `f=<id,id,...>` parameter plus per-row parameters for value, label, color, and visibility.

#### Scenario: Builder serializes rows
- **WHEN** the builder produces a card URL
- **THEN** the URL contains an ordered `f` parameter listing every row id and per-row value, label, and color parameters

#### Scenario: SVG parses rows
- **WHEN** the SVG route receives a URL with an `f` parameter
- **THEN** it renders rows in the listed order with the per-row overrides applied

### Requirement: Legacy card URLs remain valid
Card URLs that do not contain the `f` parameter SHALL continue to render the default rows with any provided value overrides.

#### Scenario: Legacy URL without f parameter
- **WHEN** a card URL contains only `distro=...&host=...` style value parameters and no `f` parameter
- **THEN** the SVG renders the default rows in default order with the provided values and theme palette colors

### Requirement: GitHub profile fetch respects custom rows
The GitHub profile fetch SHALL overwrite values only for rows whose ids already exist in the current rows; it SHALL NOT re-add deleted rows and SHALL NOT modify user labels, colors, or visibility.

#### Scenario: Fetch updates existing row values
- **WHEN** the user fetches a GitHub profile and the "host" row exists
- **THEN** the "host" row's value is overwritten with the profile data and its label and color are unchanged

#### Scenario: Fetch skips deleted rows
- **WHEN** the user fetches a GitHub profile and the "distro" row was deleted
- **THEN** no "distro" row is re-added and no other rows are modified

### Requirement: Rows display a two-digit index
The system SHALL display a two-digit zero-padded index (01, 02, ...) for each row in both the SVG card and the builder UI. The index is display-only and SHALL NOT be encoded in the card URL.

#### Scenario: SVG row numbering
- **WHEN** the SVG renders info rows
- **THEN** each row is prefixed with its 1-based index in two-digit format (01, 02, ...)

#### Scenario: Builder row numbering
- **WHEN** the builder displays info rows
- **THEN** each row card shows its 1-based index in two-digit format

#### Scenario: Numbering updates on reorder
- **WHEN** rows are reordered
- **THEN** the index numbers update to reflect the new order

#### Scenario: Numbering updates on add
- **WHEN** a new row is added
- **THEN** the new row receives the next sequential index and existing indices remain unchanged

#### Scenario: Numbering updates on delete
- **WHEN** a row is deleted
- **THEN** remaining rows re-index sequentially from 01

#### Scenario: Empty row numbering
- **WHEN** a row has empty label and empty value
- **THEN** the index still renders in the SVG (number only, no text)

### Requirement: SVG renders empty rows with number only
The system SHALL render rows with empty label and empty value by showing only the index number in the SVG, without any label or value text.

#### Scenario: Empty row in SVG
- **WHEN** a row has empty label and empty value and is visible
- **THEN** the SVG renders the index number only (no label or value text)

#### Scenario: Empty label with value
- **WHEN** a row has empty label but non-empty value
- **THEN** the SVG renders the index number followed by the value at the label position (no indent)

### Requirement: Row add animation
The system SHALL animate new rows into view with a smooth transition when the user adds a row.

#### Scenario: Add row animation
- **WHEN** the user adds a new row
- **THEN** the new row smoothly appears (fade in + slide down) and existing rows adjust their positions

