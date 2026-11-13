## Why

The installable app needs real platform-sized icons, including a maskable variant that remains legible after launcher cropping.

## What Changes

- Add a reproducible SVG-based icon generator and checked-in PNG outputs for standard, maskable, and Apple touch use.
- Ensure the white `金` mark is centered on the Finku red background and remains within the maskable safe zone.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `pwa-foundation`: Require correctly sized Finku icons and maskable-safe composition.

## Impact

Adds a generator script and icon assets under `frontend/`; no application API or backend changes.
