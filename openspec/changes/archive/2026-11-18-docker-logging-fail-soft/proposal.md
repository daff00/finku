## Why

The backend's default development file sink can fail under a non-root runtime if its log directory is not writable. Logging setup must not prevent the API from starting when console logging is available.

## What Changes

- Fall back to console-only logging when creating or opening the configured file sink fails.
- Emit a warning through the console sink and cover the unwritable-directory case with a unit test.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docker-deployment`: require file-log setup failures to preserve startup with console logging.

## Impact

- Backend logging setup and unit tests.
