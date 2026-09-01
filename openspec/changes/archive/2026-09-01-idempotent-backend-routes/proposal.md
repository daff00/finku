## Why

Network timeouts and retries are inevitable in any application. Currently, several backend routes (especially transfers) have no idempotency protection—retrying a failed request creates duplicate operations, corrupting financial data. This is unacceptable for a finance application. The fix is low-cost and uses existing infrastructure (ref_id column, unique constraints).

## What Changes

- **DELETE endpoints** (`/accounts/{id}`, `/transactions/{id}`) return 204 even if already deleted (true idempotency)
- **POST /transactions** rejects duplicate manual transactions with 409 Conflict
- **POST /transactions/transfer** adds ref_id checking + database rollback on failure to prevent orphaned transactions
- **POST /import** silently skips duplicate transactions via ref_id, returns ImportResult with counts
- **POST /balances** allows duplicate timestamps (informational, not transactional)
- **Test coverage** for retry scenarios on all write operations

## Capabilities

### New Capabilities
- `api-idempotency`: Idempotent behavior rules for all POST/DELETE routes, including deduplication strategies, error semantics, and transaction safety

### Modified Capabilities
- None (no existing spec changes; this is new behavior across existing routes)

## Impact

- **Affected routes**: All POST endpoints (transactions, transfer, import, balances, accounts) and all DELETE endpoints
- **Affected code**: `app/api/routes/transactions.py`, `app/api/routes/accounts.py`, `app/api/routes/balances.py`, `app/api/routes/imports.py`
- **Database**: No schema changes (ref_id column already exists); transaction-level rollback handling
- **Tests**: New test cases for duplicate/retry scenarios in `tests/test_*.py` files
- **No breaking changes**: Existing clients unaffected; new behavior is purely additive (409 errors only on duplicates, 204 on DELETE is idempotent)
