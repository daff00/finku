# dashboard-display-controls Specification

## Purpose

Defines shared placement for app-wide display controls and predictable coordination between global and per-section amount visibility controls on the dashboard.

## Requirements

### Requirement: Theme control is available in the shared app header
The application SHALL present the existing dark-mode control in the shared app-shell header immediately after the currency toggle, preserving its current theme switching behavior.

#### Scenario: User accesses theme control from the app header
- **WHEN** the user views an application page with the shared app shell
- **THEN** the dark-mode control appears immediately after the currency toggle in the header

#### Scenario: User changes the theme
- **WHEN** the user activates the dark-mode control
- **THEN** the application changes theme using its existing dark-mode behavior

### Requirement: Settings omits the redundant Appearance section
The Settings page SHALL NOT display the Appearance section because the shared app-shell header provides the dark-mode control at all viewport sizes.

#### Scenario: User views Settings on a mobile viewport
- **WHEN** the user views the Settings page on a mobile viewport
- **THEN** the Appearance heading and section content are absent

#### Scenario: User views Settings on a non-mobile viewport
- **WHEN** the user views the Settings page on a non-mobile viewport
- **THEN** the Appearance heading and section content are absent

### Requirement: Global amount visibility overrides section-specific settings
When the user changes global amount visibility, the application SHALL apply the resulting visibility state to every amount section, regardless of any prior section-specific settings. The user SHALL still be able to set a section-specific visibility state after the global change.

#### Scenario: Global visibility is turned off while a section is explicitly visible
- **WHEN** the user changes the global control to hidden while one or more sections have explicit visible settings
- **THEN** every amount section is hidden

#### Scenario: Global visibility is turned on after a section override
- **WHEN** the user changes the global control to visible while one or more sections have explicit hidden settings
- **THEN** every amount section is visible

#### Scenario: Section is overridden after a global change
- **WHEN** the user changes a section's visibility after changing global visibility
- **THEN** that section follows its explicit setting and other sections continue to follow the global setting
