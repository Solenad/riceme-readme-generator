## Purpose

Defines the builder preview modal: a hover-to-reveal click affordance on the preview image and a full-size theme-consistent modal for viewing the SVG preview.

## Requirements

### Requirement: Preview hover reveals click affordance
The builder preview image container SHALL display a blur effect and a `[ Click ]` text overlay when hovered, indicating the preview is clickable.

#### Scenario: Hover shows overlay
- **WHEN** the user hovers over the preview image container
- **THEN** the preview image blurs slightly and a `[ Click ]` text overlay appears centered over the image

#### Scenario: Hover away hides overlay
- **WHEN** the user moves the pointer away from the preview image container
- **THEN** the blur effect and `[ Click ]` overlay disappear, restoring the sharp preview image

### Requirement: Click opens preview modal
The builder SHALL open a full-size preview modal when the user clicks the preview image or its overlay.

#### Scenario: Click opens modal
- **WHEN** the user clicks the preview image or the `[ Click ]` overlay
- **THEN** a modal dialog opens displaying the same SVG preview at a larger size, centered on screen with a dark backdrop

#### Scenario: Modal shows full-size preview
- **WHEN** the preview modal is open
- **THEN** the SVG image renders at its full natural width (up to viewport bounds) with the same URL as the inline preview

#### Scenario: Escape closes modal
- **WHEN** the preview modal is open and the user presses Escape
- **THEN** the modal closes and focus returns to the builder

#### Scenario: Backdrop click closes modal
- **WHEN** the preview modal is open and the user clicks the dark backdrop outside the image
- **THEN** the modal closes

### Requirement: Modal uses theme-consistent styling
The preview modal SHALL use the site's existing theme tokens for its backdrop, container, and border styling.

#### Scenario: Modal backdrop styling
- **WHEN** the preview modal is open
- **THEN** the backdrop uses a semi-transparent dark overlay consistent with the site's dark theme

#### Scenario: Modal container styling
- **WHEN** the preview modal is open
- **THEN** the image container uses the site's border token color, rounded corners, and appropriate padding
