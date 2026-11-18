## Why

The PWA security boundary and update behavior need validation against the production build, especially to ensure financial API responses are never served from browser storage.

## What Changes

- Verify build output, static-only precache, deep-link fallback, API network behavior, and user-confirmed updates.
- Correct the service-worker precache configuration if production verification reveals plugin-added entries outside the approved shell/static asset set.
- Record checks that require Chrome DevTools as manual checks when the environment cannot perform them.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- None.

## Impact

Frontend verification and any narrowly scoped configuration correction needed to meet the already specified shell-only caching contract. No backend changes.
