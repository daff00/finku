## ADDED Requirements

### Requirement: Expose transaction transfer direction
The system SHALL include a nullable direction field in each transaction response, using `OUT` for the source leg, `IN` for the destination leg, and `null` for transactions without a transfer direction.

#### Scenario: Transfer response identifies both legs
- **WHEN** an authenticated user creates a transfer
- **THEN** the source transaction response has direction `OUT`
- **AND** the destination transaction response has direction `IN`.

#### Scenario: Non-transfer response has no direction
- **WHEN** an authenticated user creates an ordinary income or expense transaction
- **THEN** its response has direction `null`.
