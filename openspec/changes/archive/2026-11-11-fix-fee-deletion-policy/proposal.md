## Why

A transfer fee is an ordinary expense transaction linked from its `TransferPair`. Deleting it directly leaves a stale fee reference and breaks the transfer's integrity.

## What Changes

- Reject direct deletion of a transaction referenced as a transfer fee.
- Require users to delete the transfer, which already removes its linked fee transaction.
- Test that direct deletion is rejected and leaves the fee intact.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `api-idempotency`: Define the deletion policy for transfer fee transactions.

## Impact

- `backend/app/api/routes/transactions.py`
- `backend/tests/test_transactions.py`
- Transaction deletion API behavior
