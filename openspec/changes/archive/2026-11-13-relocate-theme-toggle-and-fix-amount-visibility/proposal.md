## Why

The theme control is currently confined to the desktop sidebar, while the app shell already provides a shared header for app-wide controls. In addition, per-section amount visibility overrides can outlive a global toggle, so visible dashboard amounts may ignore a user's attempt to hide all amounts.

## What Changes

- Move the existing dark-mode control from the sidebar into the app-shell header immediately after the currency toggle, preserving its theme behavior and accessibility.
- Remove the Appearance section from Settings because the shared app-shell header already provides the dark-mode control on mobile and desktop.
- Make each global amount-visibility toggle apply its resulting state consistently to all amount sections, while retaining per-section controls for subsequent overrides.
- Preserve existing amount visibility persistence and user/session isolation behavior.

## Capabilities

### New Capabilities
- `dashboard-display-controls`: Shared theme-control placement and coherent global/per-section dashboard amount visibility.

### Modified Capabilities
- None.

## Impact

Updates the frontend app shell, sidebar, Settings page, and amount-visibility hook, with focused UI and state-behavior tests. No backend or API changes.
