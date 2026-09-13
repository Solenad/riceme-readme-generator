## MODIFIED Requirements

### Requirement: Row colors are customizable
The system SHALL allow users to set a color per row, rendered as the label text color in the SVG and the dot indicator in the builder. When a color parameter is an empty string, the system SHALL fall back to the default field color or theme palette color.

#### Scenario: Set a custom color
- **WHEN** the user picks a color for a row
- **THEN** the generated card renders the row's label in that color and the card URL contains the row's color parameter

#### Scenario: Row without a color override
- **WHEN** a card URL has no explicit color for a row
- **THEN** the SVG assigns the theme palette color by row index (existing behavior)

#### Scenario: Empty color string falls back to default
- **WHEN** a card URL has a color parameter set to an empty string
- **THEN** the SVG falls back to the default field color or theme palette color instead of rendering black

### Requirement: GitHub profile fetch respects custom rows
The GitHub profile fetch SHALL NOT overwrite info row values. Profile fetching is for display purposes only and SHALL NOT modify the user's configured info rows.

#### Scenario: Fetch does not modify rows
- **WHEN** the user fetches a GitHub profile
- **THEN** the info rows remain unchanged and only the fetch status message updates

#### Scenario: Fetch status shows profile info
- **WHEN** the user fetches a GitHub profile successfully
- **THEN** a status message displays the profile's repo count and follower count
