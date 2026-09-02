# api-idempotency Specification

## Purpose

Ensures that retrying failed requests on POST and DELETE endpoints does not create duplicate data or leave the system in an inconsistent state. Provides clients with confidence that network timeouts or server retries can be safely retried.

## Requirements

### Requirement: Manual transaction deduplication
The system SHALL reject duplicate manual transactions with HTTP 409 Conflict. A duplicate is detected when the same transaction (same account, date, amount, and note) is submitted again.

#### Scenario: Duplicate manual transaction is rejected
- **WHEN** a client submits a POST /transactions request with the same account_id, date, amount, and note as an existing transaction
- **THEN** the system returns HTTP 409 Conflict with error message "Duplicate transaction — this entry already exists"

#### Scenario: Similar but different transactions are allowed
- **WHEN** two transactions differ in any field (date, amount, note)
- **THEN** the system creates both transactions (no conflict)

### Requirement: Transfer deduplication with atomic safety
The system SHALL detect duplicate transfer requests and return the existing transfer pair. If a transfer creation fails mid-operation, the system SHALL rollback all created data to maintain consistency. A duplicate is detected when the same transfer (same source account, destination account, date, amount, and fee) is submitted again.

#### Scenario: Duplicate transfer request returns existing pair
- **WHEN** a client submits a POST /transactions/transfer request with the same from_account_id, to_account_id, date, amount, and fee as an existing transfer
- **THEN** the system returns HTTP 409 Conflict with error message indicating the transfer already exists

#### Scenario: Transfer creation failure rolls back all transactions
- **WHEN** a transfer creation fails (e.g., database error, validation failure) after creating transaction objects but before committing
- **THEN** the system rolls back all created transactions and returns an error response with no side effects

#### Scenario: Transfer includes fee transaction
- **WHEN** a transfer includes a fee (fee > 0)
- **THEN** the system creates three transactions: from_tx, to_tx, and fee_tx, all rolled back atomically on failure

### Requirement: Import deduplication with silent success
The system SHALL silently skip duplicate transactions during import operations. A duplicate is detected when a transaction (same account, date, amount, description) has already been imported. The system SHALL return an ImportResult with counts of total parsed, imported, duplicates, and errors.

#### Scenario: Re-import same statement file
- **WHEN** a client uploads the same bank statement PDF twice
- **THEN** the system returns HTTP 201 with ImportResult showing 0 imported, N duplicates (where N is the total parsed), and 0 errors

#### Scenario: Import result includes error details
- **WHEN** import processing encounters an error (e.g., malformed transaction data)
- **THEN** the system returns ImportResult with error_details array containing human-readable error messages per failed row

### Requirement: DELETE idempotency for accounts
The system SHALL return HTTP 204 No Content for DELETE /accounts/{id} whether the account is currently active or already inactive (soft-deleted).

#### Scenario: Delete an active account
- **WHEN** a client submits DELETE /accounts/{id} for an active account
- **THEN** the system marks the account as inactive (is_active = false) and returns HTTP 204

#### Scenario: Delete an already-inactive account
- **WHEN** a client retries DELETE /accounts/{id} for an account already marked inactive
- **THEN** the system returns HTTP 204 (no error, idempotent behavior)

#### Scenario: Account with transactions cannot be deleted
- **WHEN** a client attempts to delete an account that has existing transactions
- **THEN** the system returns HTTP 409 Conflict (this is a hard constraint, not an idempotency issue)

### Requirement: DELETE idempotency for transactions
The system SHALL return HTTP 204 No Content for DELETE /transactions/{id} whether the transaction is currently active or already deleted.

#### Scenario: Delete an existing transaction
- **WHEN** a client submits DELETE /transactions/{id} for an existing transaction
- **THEN** the system soft-deletes the transaction and returns HTTP 204

#### Scenario: Delete an already-deleted transaction
- **WHEN** a client retries DELETE /transactions/{id} for a transaction already marked deleted
- **THEN** the system returns HTTP 204 (no error, idempotent behavior)

#### Scenario: Delete a non-existent transaction
- **WHEN** a client submits DELETE /transactions/{id} for a transaction that never existed
- **THEN** the system returns HTTP 204 (idempotent: the result is the same—no transaction exists)

### Requirement: Balance snapshots allow duplicate timestamps
The system SHALL allow creating multiple balance snapshots for the same account at the same timestamp. Balance snapshots are informational (not transactional) and duplicate timestamps do not pose a data corruption risk.

#### Scenario: Multiple balance snapshots at same time
- **WHEN** a client submits two POST /balances requests with the same account_id and recorded_at timestamp
- **THEN** the system creates both balance records (no deduplication, no error)

#### Scenario: Latest balance query returns most recent
- **WHEN** a client queries GET /balances/{account_id}/latest after creating multiple snapshots at the same timestamp
- **THEN** the system returns one of the snapshots (order determined by database insertion order, behavior is stable)

### Requirement: No explicit idempotency-key header required
The system SHALL NOT require or process Idempotency-Key headers. Idempotency is achieved entirely through database-level deduplication (ref_id uniqueness constraints and duplicate checks). This is appropriate for single-user per account context where network retries are low frequency and database-native dedup is sufficient.

#### Scenario: Transactional operations are safe to retry
- **WHEN** a network timeout causes a client to retry POST /transactions or POST /transactions/transfer
- **THEN** the system detects the duplicate (via ref_id) and returns 409 or existing result, preventing duplicate data entry

#### Scenario: Idempotent operations are safe to retry
- **WHEN** a network timeout causes a client to retry DELETE /accounts/{id} or DELETE /transactions/{id}
- **THEN** the system returns 204 (no side effects, no error)
