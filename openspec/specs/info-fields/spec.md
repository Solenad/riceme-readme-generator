## ADDED Requirements

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
The system SHALL allow users to move a row up or down in the list, and the generated card SHALL render rows in the user's order.

#### Scenario: Move a row up
- **WHEN** the user moves a non-first row up
- **THEN** the row swaps with the row above it and the card URL reflects the new order

#### Scenario: Move a row down
- **WHEN** the user moves a non-last row down
- **THEN** the row swaps with the row below it and the card URL reflects the new order

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
- **THEN** the rows are restored to the original default set with default labels and colors

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
