## MODIFIED Requirements

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

## ADDED Requirements

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
