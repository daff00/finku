## Why

The Docker deployment needs a reproducible acceptance check before operators rely on it with private financial data. The verification must distinguish automated results from browser-only or environment-limited checks.

## What Changes

- Run the deployment acceptance matrix for fresh startup, authentication, PWA behavior, persistent data, network exposure, non-root execution, secret handling, and build/test health.
- Record each result as passed, failed, or manual check needed without claiming unexecuted checks passed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This change verifies existing behavior and does not change product requirements; `skip_specs: true` is set in the change metadata.

## Impact

- Docker Compose test environment and acceptance evidence.
- No runtime code, API, or dependency changes.
