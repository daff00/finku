## Why

The frontend currently has no service worker, so it cannot provide an installable app shell. Adding a service worker must not make financial data appear cached or live when it is stale.

## What Changes

- Add a prompt-controlled PWA service worker that precaches only the built app shell and fingerprinted static assets.
- Route navigations to the SPA entry point while excluding API paths from navigation fallback.
- Do not configure runtime caching for API or financial responses.

## Capabilities

### New Capabilities
- `pwa-foundation`: Installable app-shell service worker with strict shell-only precaching.

### Modified Capabilities
- None.

## Impact

Adds `vite-plugin-pwa` to the frontend build and configures Workbox in `frontend/vite.config.ts`. No backend or API changes.
