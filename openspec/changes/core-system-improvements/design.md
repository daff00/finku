## Context

See proposal.md. During recent enhancements, `@router.get("/")` and `@router.post("/")` in `backend/app/api/routes/balances.py` were replaced when adding `compute_current_balance`. Meanwhile, public registration remnants remain in frontend routing and code, while the product vision is strictly local-only and invite-only.

## Goals / Non-Goals

**Goals:**
- Restore snapshot endpoints `POST /balances` and `GET /balances` to work seamlessly alongside `compute_current_balance` and `GET /balances/{account_id}/latest`.
- Ensure all 89 backend tests pass.
- Remove orphaned public registration page in frontend while keeping the admin user creation UI (`/admin/create-user`) intact.
- Align `CLAUDE.md`, `architecture.md`, and `README.md` with current codebase state.

**Non-Goals:**
- No new external auth providers or public sign-up workflows.
- No database schema migrations required (the `Balance` model and DB table already exist and are intact).

## Decisions

1. **Restore balances endpoints in `balances.py`**:
   - `list_balances` (`GET /`): Filters by `user_id == current_user.id`, optional `account_id`, pagination (`limit`, `offset`), ordered by `recorded_at.desc()`.
   - `create_balance` (`POST /`): Validates user ownership of account, rejects `payload.amount < 0` with 400, adds and commits `Balance`, returns 201.
   - Preserves `compute_current_balance` and `get_latest_balance` (`GET /{account_id}/latest`).

2. **Strict Admin Auth**:
   - `POST /api/v1/auth/register` requires `x_admin_key == settings.ADMIN_SECRET_KEY` unconditionally.
   - Delete unused `frontend/src/pages/RegisterPage.tsx`.

3. **Documentation Updates**:
   - `CLAUDE.md`: Update file trees, route listings, auth rules, model fields, and status list.
   - `architecture.md`: Document single admin registration, multi-currency conversion, and context usage.
   - `README.md`: Check off completed UI pages and highlight multi-currency & privacy features.

## Risks / Trade-offs

- [Risk] Rate limiting on restored balances endpoints could affect rapid testing.
  → Mitigation: Use existing `balances_limit` which applies `API_RATE_LIMIT` appropriately.

