## ADDED Requirements

### Requirement: Install metadata is available in the web manifest
The frontend SHALL publish a web manifest identifying the app as Finku with the specified root scope, standalone display, orientation, description, colors, and icon references.

#### Scenario: Browser reads the Finku manifest
- **WHEN** a browser loads the web manifest
- **THEN** it receives the name `Finku`, short name `Finku`, description `Personal finance tracker`, start URL `/`, scope `/`, standalone display, and any orientation
- **AND** the background color is `#FAFAF8` and the theme color is `#C0392B`
- **AND** the manifest references 192x192, 512x512 any-purpose, and 512x512 maskable icons
