## 1. Frontend production image

- [x] 1.1 Add a multi-stage Node 22 build with `npm ci`, production build, and configurable relative `VITE_API_URL`.
- [x] 1.2 Add an unprivileged nginx runtime image serving only the production `dist` output.
- [x] 1.3 Add nginx proxy, SPA routing, cache-control, and upload-size rules.
- [x] 1.4 Add frontend Docker build-context exclusions.

## 2. Verification

- [x] 2.1 Build the frontend image and verify root, deep route, PWA cache headers, and API proxy behavior.
- [x] 2.2 Run frontend build/tests and backend suite.
- [x] 2.3 Validate the OpenSpec change and record the manual archive command.
