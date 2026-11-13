## Why

A service-worker update can replace the running app and interrupt a user's in-progress transaction. Users need to choose when to apply a new version.

## What Changes

- Show a small, non-blocking update notice only when a new worker is waiting.
- Let the user apply the update explicitly or dismiss the notice for later.
- Mount the prompt once outside route-specific content and declare the plugin's virtual module types.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `pwa-foundation`: Require an explicit user action before applying a waiting app update.

## Impact

Adds a shared frontend component and TypeScript declaration and mounts the component in the app root. No backend or API changes.
