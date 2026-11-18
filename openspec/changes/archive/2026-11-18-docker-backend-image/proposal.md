## Why

The backend currently runs from a developer environment and writes logs relative to its working directory, preventing reliable non-root container operation. A production image is needed as the foundation for a single-instance, persistent SQLite home-server deployment.

## What Changes

- Add a multi-stage Python 3.12 backend image built with uv and runtime dependencies only.
- Run Uvicorn as a non-root user and healthcheck the API without requiring curl.
- Keep SQLite data out of the image and make file logging configurable with stdout-only production defaults.

## Capabilities

### New Capabilities

- `docker-deployment`: defines production container behavior for the Finku backend.

### Modified Capabilities

None.

## Impact

- New backend Dockerfile and Docker build context exclusions.
- Backend logging and environment configuration.
- The existing API runtime dependencies and migration environment.
