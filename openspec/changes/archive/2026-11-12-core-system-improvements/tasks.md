## 1. Backend Core Route Fixes

- [x] 1.1 Restore `list_balances` (`GET /api/v1/balances`) and `create_balance` (`POST /api/v1/balances`) in `backend/app/api/routes/balances.py`
- [x] 1.2 Enforce strict admin key verification on `POST /api/v1/auth/register` in `backend/app/api/routes/auth.py`

## 2. Frontend Cleanup

- [x] 2.1 Remove obsolete `frontend/src/pages/RegisterPage.tsx`
- [x] 2.2 Clean up commented registration route references in `frontend/src/App.tsx`

## 3. Testing & Verification

- [x] 3.1 Run pytest backend test suite and verify all 89 tests pass with 0 failures
- [x] 3.2 Verify frontend builds and lint/typechecks cleanly

## 4. Documentation Synchronization

- [x] 4.1 Update `CLAUDE.md` to reflect full repository structure, endpoints, models, and current status
- [x] 4.2 Update `architecture.md` with multi-currency, state management, and invite-only privacy decisions
- [x] 4.3 Update `README.md` roadmap and feature summary
