## Why

The backend and frontend images need an ordered deployment that applies SQLite migrations once, starts one API instance only after migrations succeed, and exposes only the nginx frontend. Required secrets must fail fast rather than silently starting with insecure or missing credentials.

## What Changes

- Add a root Docker Compose stack with a one-shot migration service, a single private backend service, and one published frontend port.
- Persist SQLite on a named volume and require secrets through Compose interpolation.
- Reject empty or known-placeholder secrets in production and verify nginx forwarding preserves the client IP for IP-based rate limits.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docker-deployment`: specify single-instance SQLite orchestration, migration ordering, port exposure, and production secret handling.

## Impact

- Root Compose configuration and backend `.env.example`.
- Backend settings and production configuration tests.
- Compose-level health, secret, and IP-forwarding verification.
