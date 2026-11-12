## Why

Recent changes inadvertently removed the core balance snapshot route handlers (`POST /api/v1/balances` and `GET /api/v1/balances`), breaking 27 unit tests and disrupting the balance snapshot calculation foundation. In addition, the repository contains orphaned public registration UI code (`RegisterPage.tsx`) which contradicts FinKu's privacy-first, local-only architectural goal where all user creation is invite-only via administrative credentials (`X-Admin-Key`). 

## What Changes

- **Restore Core Balance Endpoints**: Re-implement `POST /api/v1/balances` (snapshot creation) and `GET /api/v1/balances` (snapshot listing) with user isolation, negative-amount rejection, and rate limiting.
- **Enforce Invite-Only Admin Auth**: Ensure user registration (`POST /api/v1/auth/register`) strictly requires `X-Admin-Key`, clean up obsolete public registration UI (`RegisterPage.tsx`), and document the admin-only user onboarding model.
- **Synchronize Project Documentation**: Update `CLAUDE.md`, `architecture.md`, and `README.md` to reflect the current state of the backend routes, multi-currency support, dark mode, context state, and test suites.

## Capabilities

### New Capabilities
- `balance-snapshots`: Standardizes balance snapshot creation and retrieval endpoints with validation and user isolation.
- `local-admin-auth`: Enforces privacy-first, invite-only user provisioning restricted by administrative secret keys.

### Modified Capabilities
<!-- None -->

## Impact

- `backend/app/api/routes/balances.py`: Restores missing `@router.post("/")` and `@router.get("/")` endpoints.
- `backend/app/api/routes/auth.py`: Ensures registration strictly validates `X-Admin-Key` against `ADMIN_SECRET_KEY`.
- `frontend/src/pages/RegisterPage.tsx`: Removed obsolete registration page.
- `frontend/src/App.tsx`: Cleaned up commented registration route references.
- Documentation: `CLAUDE.md`, `architecture.md`, and `README.md` updated.
- Tests: Restores full passing status across all backend tests.

