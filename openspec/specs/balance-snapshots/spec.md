## Purpose

Provides persistent balance snapshot creation and historical retrieval to establish baseline balances for personal net worth calculations.

## Requirements

### Requirement: Record Balance Snapshot
The system SHALL allow authenticated users to record a point-in-time balance snapshot for an account owned by them via `POST /api/v1/balances`.

#### Scenario: Successfully create balance snapshot
- **WHEN** an authenticated user posts a valid payload with `account_id` and non-negative `amount`
- **THEN** the system persists the snapshot and returns HTTP 201 Created with the balance details.

#### Scenario: Reject negative snapshot amount
- **WHEN** an authenticated user attempts to create a balance snapshot with amount less than zero
- **THEN** the system rejects the request with HTTP 400 Bad Request.

#### Scenario: Reject snapshot for non-existent or foreign account
- **WHEN** a user posts a balance snapshot for an account ID that does not exist or belongs to another user
- **THEN** the system responds with HTTP 404 Not Found.

### Requirement: List Balance Snapshots
The system SHALL allow authenticated users to list their recorded balance snapshots via `GET /api/v1/balances` with optional filtering by `account_id` and pagination.

#### Scenario: List snapshots with account filter
- **WHEN** an authenticated user queries `GET /api/v1/balances?account_id={id}`
- **THEN** the system returns only snapshots belonging to the specified account and owned by the authenticated user with HTTP 200 OK.

### Requirement: Atomically create account baseline
The system SHALL create a zero-valued balance snapshot at the Unix epoch in the same database transaction as a new account.

#### Scenario: Account and baseline are committed together
- **WHEN** an authenticated user successfully creates an account
- **THEN** the account and its zero baseline snapshot, scoped to that user, are both persisted
- **AND** the baseline's `recorded_at` is `1970-01-01T00:00:00+00:00`.

#### Scenario: Baseline creation fails
- **WHEN** creation of the account's baseline snapshot fails
- **THEN** the account and baseline are both rolled back.
