## Purpose

Defines input validation for the builder: GitHub username format validation with fetch blocking, field-level duplicate label warnings, and character count indicators for values approaching wrap limits.

## ADDED Requirements

### Requirement: Username format validation
The builder SHALL validate the GitHub username input against the format `^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$` and disable the Fetch button when the format is invalid.

#### Scenario: Valid username enables fetch
- **WHEN** the user types "Solenad" (valid format)
- **THEN** the Fetch button is enabled

#### Scenario: Invalid username disables fetch
- **WHEN** the user types "-invalid" (starts with hyphen)
- **THEN** the Fetch button is disabled

#### Scenario: Empty username disables fetch
- **WHEN** the username input is empty
- **THEN** the Fetch button is disabled

#### Scenario: Username with spaces disables fetch
- **WHEN** the user types "Solenad Dizon" (contains space)
- **THEN** the Fetch button is disabled

#### Scenario: Single character username is valid
- **WHEN** the user types "a"
- **THEN** the Fetch button is enabled (single alphanumeric character is valid)

#### Scenario: Maximum length username
- **WHEN** the user types a 39-character alphanumeric string
- **THEN** the Fetch button is enabled

#### Scenario: Over-length username disables fetch
- **WHEN** the user types a 40-character string
- **THEN** the Fetch button is disabled

### Requirement: Username validation feedback
The builder SHALL display inline feedback below the username input indicating whether the format is valid.

#### Scenario: Invalid format shows error
- **WHEN** the username format is invalid
- **THEN** a red-bordered hint appears below the input with the message "Must be 1-39 chars, alphanumeric and hyphens"

#### Scenario: Valid format shows no error
- **WHEN** the username format is valid
- **THEN** no error hint is displayed

#### Scenario: Empty input shows no error
- **WHEN** the username input is empty
- **THEN** no error hint is displayed (neutral state)

### Requirement: GitHub profile fetch status
The builder SHALL display inline feedback after a profile fetch attempt indicating success, failure, or rate limiting.

#### Scenario: Profile found shows success
- **WHEN** the user fetches a profile and the API returns 200
- **THEN** a green checkmark appears with "Profile found" and a summary (e.g., "42 repos · 1.2k followers")

#### Scenario: Profile not found shows error
- **WHEN** the user fetches a profile and the API returns 404
- **THEN** a red X appears with "User not found on GitHub"

#### Scenario: Rate limited shows warning
- **WHEN** the user fetches a profile and the API returns 403
- **THEN** a yellow warning appears with "Rate limited by GitHub. Try again later."

#### Scenario: Network error shows error
- **WHEN** the user fetches a profile and the request fails
- **THEN** a red X appears with "Failed to fetch profile"

#### Scenario: Status clears on new input
- **WHEN** the user types a new username after a fetch result
- **THEN** the previous fetch status is cleared

### Requirement: Duplicate label detection
The builder SHALL detect when multiple fields share the same label and display a warning.

#### Scenario: Duplicate labels show warning
- **WHEN** two fields both have the label "Shell"
- **THEN** a warning icon appears next to each duplicate with the text "appears N times"

#### Scenario: Single instance shows no warning
- **WHEN** a field label is unique
- **THEN** no duplicate warning is shown

#### Scenario: Empty labels are excluded
- **WHEN** two fields both have empty labels
- **THEN** no duplicate warning is shown (empty labels are not counted as duplicates)

#### Scenario: Case-insensitive comparison
- **WHEN** one field has label "shell" and another has "Shell"
- **THEN** a duplicate warning is shown (comparison is case-insensitive)

### Requirement: Character count indicator
The builder SHALL display a character count indicator for field values approaching the maximum comfortable width (~64 characters).

#### Scenario: Short value shows no indicator
- **WHEN** a field value is less than 48 characters
- **THEN** no character count is shown

#### Scenario: Approaching limit shows count
- **WHEN** a field value is between 48 and 64 characters
- **THEN** a character count appears (e.g., "52/64") in muted text

#### Scenario: At limit shows warning
- **WHEN** a field value is 64 or more characters
- **THEN** the character count turns yellow/red to indicate the value may wrap in the SVG

### Requirement: Field count indicator
The builder SHALL display a field count indicator showing current/max fields.

#### Scenario: Normal field count
- **WHEN** the field count is below 14
- **THEN** the counter shows "N/16" in muted text

#### Scenario: High field count warning
- **WHEN** the field count is 14 or 15
- **THEN** the counter turns yellow

#### Scenario: Maximum field count
- **WHEN** the field count is 16
- **THEN** the counter turns red and the Add Row button is disabled
