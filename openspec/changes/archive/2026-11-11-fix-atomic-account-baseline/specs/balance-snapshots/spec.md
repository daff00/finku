## ADDED Requirements

### Requirement: Atomically create account baseline
The system SHALL create a zero-valued balance snapshot at the Unix epoch in the same database transaction as a new account.

#### Scenario: Account and baseline are committed together
- **WHEN** an authenticated user successfully creates an account
- **THEN** the account and its zero baseline snapshot, scoped to that user, are both persisted
- **AND** the baseline's `recorded_at` is `1970-01-01T00:00:00+00:00`.

#### Scenario: Baseline creation fails
- **WHEN** creation of the account's baseline snapshot fails
- **THEN** the account and baseline are both rolled back.
