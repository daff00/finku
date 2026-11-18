## Why

The app shell needs clear, consistent identity and display behavior when installed on supported browsers and devices.

## What Changes

- Complete the web manifest with Finku metadata, standalone display, root scope, theme colors, and icon references.
- Add the theme-color and iOS web-app metadata tags while retaining the SVG favicon.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `pwa-foundation`: Define the app identity and installation metadata exposed by the manifest.

## Impact

Updates the PWA plugin manifest configuration and `frontend/index.html`. No API or backend changes.
