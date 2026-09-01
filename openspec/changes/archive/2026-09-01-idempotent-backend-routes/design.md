## Context

The codebase already has the foundation for deduplication: a `ref_id` column on the Transaction model with a unique constraint, and deduplication logic in the BaseParser.save_to_db() method. However, idempotency is inconsistently applied:

- POST /transactions uses ref_id checks (good)
- POST /transactions/transfer has NO duplicate detection (dangerous for financial data)
- DELETE endpoints return 404 instead of 204 (not idempotent)
- POST /balances allows true duplicates without constraint

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Make POST /transactions/transfer idempotent and transactionally safe (prevent duplicate transfers, rollback on failure)
- Make DELETE endpoints idempotent (return 204 even if already deleted)
- Standardize duplicate handling across all write endpoints (409 for operations, silent skip for imports)
- Add test coverage for retry scenarios
- No new external dependencies or infrastructure (no Redis, no idempotency-key table)

**Non-Goals:**
- Add Idempotency-Key header support (deferred to Phase 2 when multi-user)
- Implement distributed idempotency store
- Change database schema (ref_id column already exists)
- Modify read endpoints

## Decisions

### Decision 1: Use ref_id hash for deduplication (database-level)
**Chosen approach:** Generate deterministic hash of operation parameters (account_id, date, amount, description) → store in ref_id column → unique constraint catches duplicates.

**Rationale:**
- Already implemented for POST /transactions and import
- Zero external dependencies
- Works offline (database-native)
- Deterministic: same operation always produces same ref_id
- Single-user context doesn't need Idempotency-Key header (client identity is implicit)

**Alternatives considered:**
- Idempotency-Key header + response cache: More robust for multi-user, but requires storage + cleanup logic. Deferred to Phase 2.
- Application-level duplicate detection (query before insert): Same cost, less reliable (race condition between query and insert). Database constraints are better.

### Decision 2: 409 Conflict for transactional duplicates, silent skip for imports
**Chosen approach:**
- Manual transactions (POST /transactions): Return 409 Conflict
- Transfers (POST /transactions/transfer): Return 409 Conflict
- Imports (POST /import): Silent skip, return ImportResult with counts

**Rationale:**
- Manual transaction: Single operation, user should know if duplicate → 409 is good UX signal
- Transfer: Single operation, user should know if failed and being retried → 409 signals retry safety
- Import: Batch operation where duplicates are expected → silent skip with count visibility is appropriate

**Alternatives considered:**
- Silent success for all (return 200 with existing data): Less informative, doesn't signal to user that nothing changed
- Error for all: Import would reject legitimate re-uploads, bad UX

### Decision 3: Wrap transfer creation in try/except with db.rollback()
**Chosen approach:**
```
try:
    create from_tx, to_tx, fee_tx (if applicable)
    flush (assign IDs)
    check for duplicate ref_id
    create TransferPair
    commit
except Exception:
    rollback
    raise
```

**Rationale:**
- Prevents orphaned transactions if creation fails mid-way
- Ensures atomicity: either all transactions + pair created, or none
- If exception occurs after flush but before commit, rollback cleans up orphaned IDs
- Duplicate check happens AFTER flush so ref_ids exist for comparison

**Alternatives considered:**
- Check duplicate BEFORE creating transactions: Can't work because transaction IDs don't exist yet
- Let database constraint catch it: Would leave orphaned transactions, violating referential integrity

### Decision 4: DELETE returns 204 for both active and already-deleted
**Chosen approach:**
- DELETE /accounts/{id}: Check if exists OR is inactive → return 204 either way
- DELETE /transactions/{id}: Check if exists OR is deleted → return 204 either way

**Rationale:**
- True idempotency: operation has no side effect when called twice
- No information leak (caller can't tell if it was active before)
- Matches REST/HTTP semantics for safe deletion

**Alternatives considered:**
- Return 404 if already deleted: Not idempotent, breaks retry safety
- Return 410 Gone: Signals "was here, now gone" but still not safe for retry

### Decision 5: Allow duplicate balance timestamps
**Chosen approach:**
- No ref_id check for POST /balances
- Allow (account_id, recorded_at) duplicates
- Query for latest balance returns one snapshot (stable order)

**Rationale:**
- Balance snapshots are informational, not transactional
- No financial risk (no money movement)
- User might intentionally record same state twice for verification
- Duplicate snapshots just noise, can be cleaned later

**Alternative considered:**
- Add UNIQUE(account_id, recorded_at) constraint: Would prevent re-recording, but blocks legitimate use cases

### Decision 6: No Idempotency-Key header support in this phase
**Chosen approach:**
- Use database-native deduplication only
- No header parsing or validation
- No response caching table

**Rationale:**
- Single-user per account context: header not needed (user identity implicit in token)
- Adds complexity (table, cleanup job) without current benefit
- Can be added in Phase 2 when multi-user deployed
- Existing ref_id dedup is sufficient for MVP

**Alternative considered:**
- Add header support now: Prepares for multi-user, but over-engineers MVP. Add when actually needed.

## Risks / Trade-offs

**[Risk] Duplicate check via ref_id hash collision**
→ Mitigation: Use SHA256 (2^128 security level), hash includes all identifying fields. Collision probability is negligible for application scale.

**[Risk] Transfer duplicate check occurs after flush; IDs are assigned but might not be part of pair yet**
→ Mitigation: Rollback on any exception ensures orphaned transactions are cleaned up. Duplicate check happens before pair creation, so orphaned transactions are impossible in production.

**[Risk] Balance snapshots without UNIQUE constraint could accumulate 1000s of identical entries**
→ Mitigation: Not a blocker for MVP. User can manually delete via API if needed. Can add constraint in V2 if it becomes a problem.

**[Risk] DELETE idempotency hides errors (e.g., database corruption)**
→ Mitigation: Acceptable for MVP. In production, detailed audit logs would capture actual deletion events separately.

**[Trade-off] No Idempotency-Key header = can't support multi-user idempotency safely**
→ Acceptable for MVP (single-user). Will add Phase 2 when multi-tenant deployed.

## Migration Plan

1. Deploy code changes to all endpoints (no database migration needed, ref_id column already exists)
2. Existing in-flight requests unaffected (409 responses are new only for actual duplicates)
3. No breaking changes (existing clients still work, new behavior only on retries)
4. Rollback: If needed, revert code; no data cleanup required

## Open Questions

None—all design decisions are finalized and ready for implementation.
