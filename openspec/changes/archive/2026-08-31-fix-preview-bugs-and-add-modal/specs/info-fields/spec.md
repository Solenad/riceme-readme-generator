## MODIFIED Requirements

### Requirement: SVG renders empty rows with number only
The system SHALL completely skip rendering rows that have both empty label and empty value. Such rows SHALL NOT render any index number, SHALL NOT allocate vertical space, and SHALL NOT affect the layout of subsequent rows or sections.

#### Scenario: Empty row is completely hidden in SVG
- **WHEN** a row has empty label and empty value and is visible
- **THEN** the SVG renders nothing for that row — no index number, no label, no value — and the row occupies zero vertical space

#### Scenario: Empty label with value
- **WHEN** a row has empty label but non-empty value
- **THEN** the SVG renders the index number followed by the value at the label position (no indent)

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
