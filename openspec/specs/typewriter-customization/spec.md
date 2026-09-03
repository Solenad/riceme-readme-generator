## Purpose

Defines the typewriter customization capability: user-configurable phrases, typing speed, and inter-phrase pause for the terminal-style animation at the bottom of the generated SVG card.

## Requirements

### Requirement: Builder provides typewriter phrase inputs
The builder SHALL display two text input fields for typewriter phrases, labeled "Phrase 1" and "Phrase 2", each with a maximum length of 48 characters and a character counter.

#### Scenario: Empty phrases show no animation
- **WHEN** both phrase inputs are empty
- **THEN** the generated SVG contains no typewriter animation elements

#### Scenario: Character limit enforced
- **WHEN** the user types more than 48 characters in a phrase input
- **THEN** the input rejects further characters and the character counter shows 48/48

#### Scenario: Character counter updates
- **WHEN** the user types or deletes text in a phrase input
- **THEN** the character counter updates to show current length out of 48

### Requirement: Builder provides typing speed control
The builder SHALL display a slider for typing speed with a range of 0.5x to 2.0x and a default of 1.0x. The current speed value SHALL be displayed next to the slider.

#### Scenario: Adjust typing speed
- **WHEN** the user moves the speed slider to 2.0x
- **THEN** the generated SVG animates typing at twice the base speed

#### Scenario: Speed default
- **WHEN** the user has not adjusted the speed slider
- **THEN** the speed is 1.0x

### Requirement: Builder provides pause duration control
The builder SHALL display a slider for pause duration between phrases with a range of 0ms to 3000ms and a default of 500ms. The current pause value SHALL be displayed next to the slider.

#### Scenario: Adjust pause duration
- **WHEN** the user moves the pause slider to 2000ms
- **THEN** the generated SVG waits 2000ms between finishing phrase 1 and starting phrase 2

#### Scenario: Pause default
- **WHEN** the user has not adjusted the pause slider
- **THEN** the pause duration is 500ms

### Requirement: Typewriter section placement in builder
The builder SHALL display the typewriter section below the info rows section and above the theme selector.

#### Scenario: Section visibility
- **WHEN** the builder page loads
- **THEN** the typewriter section is visible with phrase inputs, speed slider, and pause slider

### Requirement: Typewriter state serialized to URL
The builder state SHALL include typewriter configuration and serialize it to URL parameters `tw_p1`, `tw_p2`, `tw_spd`, and `tw_pau`.

#### Scenario: URL contains typewriter params
- **WHEN** the user sets phrase 1 to "hello", phrase 2 to "world", speed to 1.5x, and pause to 1000ms
- **THEN** the builder URL contains `tw_p1=hello`, `tw_p2=world`, `tw_spd=1.5`, `tw_pau=1000`

#### Scenario: Default values omitted from URL
- **WHEN** the user has not customized typewriter settings
- **THEN** the builder URL does not contain `tw_*` parameters

### Requirement: SVG route parses typewriter params
The SVG route SHALL parse `tw_p1`, `tw_p2`, `tw_spd`, and `tw_pau` from the request URL and use them to generate the typewriter animation.

#### Scenario: SVG renders custom phrases
- **WHEN** the SVG URL contains `tw_p1=hello&tw_p2=world`
- **THEN** the generated SVG animates typing "hello", pausing, then typing "world"

#### Scenario: SVG uses custom speed
- **WHEN** the SVG URL contains `tw_spd=2.0`
- **THEN** the generated SVG animates typing at twice the base speed

#### Scenario: SVG uses custom pause
- **WHEN** the SVG URL contains `tw_pau=2000`
- **THEN** the generated SVG waits 2000ms between phrases

#### Scenario: No typewriter params renders no animation
- **WHEN** the SVG URL contains no `tw_*` parameters
- **THEN** the generated SVG contains no typewriter animation elements

### Requirement: SVG animation timing scales with speed
The SVG typewriter animation SHALL scale all phase durations (type, hold, delete, empty hold) by the inverse of the speed multiplier.

#### Scenario: Speed scales all durations
- **WHEN** the speed multiplier is 2.0x and phrase 1 is 10 characters
- **THEN** the type duration is 400ms (10 chars × 80ms ÷ 2), the hold is 750ms, and the delete is 250ms

### Requirement: SVG handles single-phrase mode
The SVG SHALL render correctly when only one phrase is provided.

#### Scenario: Only phrase 1 provided
- **WHEN** `tw_p1` is set and `tw_p2` is empty
- **THEN** the SVG types and deletes phrase 1 with no phrase 2 animation

#### Scenario: Only phrase 2 provided
- **WHEN** `tw_p1` is empty and `tw_p2` is set
- **THEN** the SVG skips directly to typing phrase 2

### Requirement: BuilderState includes typewriter config
The `BuilderState` interface SHALL include a `typewriter` object with `phrase1`, `phrase2`, `speed`, and `pause` fields.

#### Scenario: BuilderState default
- **WHEN** the builder initializes with no URL params
- **THEN** the typewriter state is `{ phrase1: "", phrase2: "", speed: 1.0, pause: 500 }`

#### Scenario: BuilderState hydration from URL
- **WHEN** the builder URL contains `tw_p1=hi&tw_spd=1.5`
- **THEN** the builder state is hydrated with `phrase1: "hi"`, `speed: 1.5`, and defaults for missing fields
