## Why

The production frontend needs to serve the built single-page application while keeping browser requests same-origin with the private backend. A static, unprivileged nginx image provides the deployment boundary without exposing a development server or publishing the API separately.

## What Changes

- Add a multi-stage Node build and unprivileged nginx runtime image.
- Add nginx SPA fallback, API and health proxying, and cache policies for the app shell and fingerprinted assets.
- Support a build-time relative `VITE_API_URL`, sensible PDF upload size, and exclude local frontend files from the build context.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docker-deployment`: specify static frontend serving and same-origin nginx proxy behavior.

## Impact

- New frontend Dockerfile, nginx configuration, and Docker build-context exclusions.
- Existing PWA shell routes and API calls remain on the same origin.
