## Purpose

Delta spec for `info-fields` capability. Modifies the "Legacy card URLs remain valid" requirement to tighten fallback behavior when the `f` param is present.

## MODIFIED Requirements

### Requirement: Legacy card URLs remain valid
Card URLs that do not contain the `f` parameter SHALL continue to render the default rows with any provided value overrides. When the `f` parameter IS present, the URL SHALL be treated as a complete state snapshot — the system SHALL NOT fall back to `DEFAULT_FIELDS` values for any field that exists in the `f` list.

#### Scenario: Legacy URL without f parameter
- **WHEN** a card URL contains only `distro=...&host=...` style value parameters and no `f` parameter
- **THEN** the SVG renders the default rows in default order with the provided values and theme palette colors

#### Scenario: URL with f parameter uses URL data only
- **WHEN** a card URL contains `f=host` and `host=CustomValue` but the `DEFAULT_FIELDS` has `host` with value "Solenad"
- **THEN** the SVG renders "CustomValue" as the host value (not "Solenad")

#### Scenario: Missing value in URL with f parameter shows empty
- **WHEN** a card URL contains `f=host` but no `host=<value>` parameter
- **THEN** the SVG renders an empty value for the host field (not the default "Solenad")

#### Scenario: Unknown field ID in f parameter
- **WHEN** a card URL contains `f=my-custom-field` and `my-custom-field=React, Vue`
- **THEN** the SVG renders a row with id "my-custom-field", value "React, Vue", label from `my-custom-field_label` or raw id, and palette color by index

#### Scenario: Field order matches f parameter
- **WHEN** a card URL contains `f=uptime,host,distro`
- **THEN** the SVG renders rows in that exact order (uptime first, host second, distro third)
