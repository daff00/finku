## 1. Runtime acceptance

- [x] 1.1 Start a clean isolated Compose project and verify migration exits zero and services become healthy.
- [x] 1.2 Verify user login through the nginx-published port.
- [x] 1.3 Verify a hard refresh of `/transactions` returns the application.
- [x] 1.4 Verify browser service-worker registration and confirm API responses are absent from Cache Storage.
- [x] 1.5 Verify persisted data survives `docker compose restart` and `down` followed by `up`.

## 2. Security and configuration

- [x] 2.1 Verify backend port 8000 is not reachable from the host.
- [x] 2.2 Verify the backend process runs as non-root.
- [x] 2.3 Verify backend/frontend images contain no environment secrets or local `.env` files.
- [x] 2.4 Verify Compose rejects missing secrets and backend startup rejects placeholder production secrets.

## 3. Build and report

- [x] 3.1 Run the full backend suite and record the passing test count.
- [x] 3.2 Run the frontend production build and test suite.
- [x] 3.3 Record every acceptance check as passed, failed, or manual check needed with evidence.
