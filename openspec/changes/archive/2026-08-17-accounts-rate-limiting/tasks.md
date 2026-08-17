## 1. Limiter Foundation

- [x] 1.1 Add `slowapi` to the backend dependency set and make sure the limiter can be initialized from the FastAPI app.
- [x] 1.2 Add a shared rate limit handler so blocked requests return the backend's JSON error shape with HTTP 429.
- [x] 1.3 Define the initial accounts rate limit policy and keep it configurable in backend settings.

## 2. Accounts Enforcement

- [x] 2.1 Add authenticated-user context to the request flow so limiter keys can be scoped per user.
- [x] 2.2 Apply rate limiting to all accounts endpoints only, including list, create, detail, update, delete, and account transactions.
- [x] 2.3 Ensure normal account requests continue to behave exactly as before when the user stays within the configured limit.

## 3. Tests and Verification

- [x] 3.1 Add backend tests that confirm accounts requests succeed below the limit.
- [x] 3.2 Add backend tests that confirm accounts requests return 429 after the limit is exceeded.
- [x] 3.3 Add backend tests that confirm the rate limit is scoped per authenticated user rather than globally shared across users.
