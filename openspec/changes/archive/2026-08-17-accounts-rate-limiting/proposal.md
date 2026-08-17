## Why

The backend has no request throttling yet, so a single client can still hammer authenticated endpoints and create unnecessary load or noisy failures. We want a lightweight, backend-only limiter now, starting with accounts endpoints, so the app gets a clear abuse boundary without adding infrastructure that is too heavy for a personal deployment.

## What Changes

- Add backend rate limiting with `slowapi`.
- Apply limits to accounts endpoints first, using authenticated-user-based throttling.
- Return standard `429 Too Many Requests` responses when a client exceeds the configured limit.
- Keep the implementation backend-only for now; frontend behavior is unchanged in this change.
- Leave analytics, transactions, balances, and imports for later follow-up changes that can reuse the same limiter pattern.

## Capabilities

### New Capabilities
- `accounts-rate-limiting`: Rate limit the accounts API routes so a user who exceeds the allowed request rate receives a 429 response while normal usage remains unaffected.

### Modified Capabilities
- None

## Impact

- Backend FastAPI app setup and middleware/exception handling
- Accounts route handlers and request throttling behavior
- Backend dependencies and test fixtures
- Backend test coverage for normal and over-limit account requests
- Future extension path for analytics, transactions, balances, and imports
