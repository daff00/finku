## ADDED Requirements

### Requirement: Preserve transfer fee links during deletion
The system SHALL prevent a transfer fee transaction from being deleted independently of its transfer.

#### Scenario: Direct deletion of a fee transaction
- **WHEN** an authenticated user deletes a transaction referenced by `TransferPair.fee_transaction_id`
- **THEN** the system returns HTTP 400 with the message `Cannot delete a transfer fee directly. Delete the transfer instead.`
- **AND** the fee transaction and transfer pair remain unchanged.

#### Scenario: Delete transfer with a linked fee
- **WHEN** an authenticated user deletes either transaction leg of a transfer with a linked fee
- **THEN** the system deletes both transfer legs, the transfer pair, and the linked fee transaction.
