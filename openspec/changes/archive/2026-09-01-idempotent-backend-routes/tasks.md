## 1. Manual Transaction Deduplication

- [x] 1.1 Verify POST /transactions already uses ref_id deduplication (should be working, add test if missing)
- [x] 1.2 Add test: test_create_duplicate_transaction() — verify 409 on duplicate manual entry
- [x] 1.3 Add test: test_create_duplicate_transaction_retry() — send same transaction twice, expect 409 both times

## 2. Transfer Deduplication and Rollback Safety

- [x] 2.1 Update POST /transactions/transfer to generate ref_id for both from_tx and to_tx (using existing make_ref_id helper)
- [x] 2.2 Add duplicate check AFTER db.flush() — query TransferPair or check from_tx ref_id existence
- [x] 2.3 Wrap entire transfer creation in try/except block with db.rollback() on exception
- [x] 2.4 Return 409 Conflict if duplicate transfer detected (same message as manual transactions)
- [x] 2.5 Add test: test_create_transfer_idempotent() — send same transfer twice, expect 409 both times
- [x] 2.6 Add test: test_create_transfer_with_fee_idempotent() — verify fee transaction also included in dedup check
- [x] 2.7 Add test: test_create_transfer_rollback_on_failure() — mock database error, verify all transactions rolled back

## 3. DELETE Idempotency

- [x] 3.1 Update DELETE /accounts/{id} to return 204 if account is already inactive (not 404)
- [x] 3.2 Update DELETE /transactions/{id} to return 204 if transaction is deleted or not found (not 404)
- [x] 3.3 Add test: test_delete_account_idempotent() — delete account, retry delete, both return 204
- [x] 3.4 Add test: test_delete_transaction_idempotent() — delete transaction, retry delete, both return 204
- [x] 3.5 Add test: test_delete_nonexistent_transaction() — delete transaction that never existed, expect 204

## 4. Import Deduplication Verification

- [x] 4.1 Verify POST /import already uses silent skip with ImportResult counts (should be working)
- [x] 4.2 Add test: test_import_bca_statement_idempotent() — upload same PDF twice, expect 201 both times with correct counts (second has 0 imported, N duplicates)
- [x] 4.3 Verify ImportResult response includes error_details array
- [x] 4.4 Add test: test_import_with_parse_errors() — upload file with invalid data, verify error_details populated

## 5. Balance Snapshot Handling

- [x] 5.1 Verify POST /balances allows duplicate (account_id, recorded_at) entries (should be working, no code change needed)
- [x] 5.2 Add test: test_create_balance_duplicate_timestamp() — create two balances at same timestamp, expect both created
- [x] 5.3 Add test: test_get_latest_balance_with_duplicates() — with duplicate timestamps, verify latest returns stable result

## 6. Account Creation Deduplication

- [x] 6.1 Generate ref_id for POST /accounts (account name should be unique per user, use: sha256(user_id, name, bank))
- [x] 6.2 Add duplicate check before account creation
- [x] 6.3 Return 409 Conflict if duplicate account (same name + bank) already exists
- [x] 6.4 Add test: test_create_account_duplicate_name() — create BCA account twice with same name, expect 409

## 7. Documentation and Code Review

- [x] 7.1 Add inline comments explaining ref_id generation and dedup logic in each route
- [x] 7.2 Update CLAUDE.md or backend README with idempotency rules and error semantics
- [x] 7.3 Review all changes for consistency (error messages, status codes, response formats)
- [x] 7.4 Verify all new tests pass and existing tests still pass (run full test suite)
- [x] 7.5 Code review: Check rollback exception handling in transfer route
