## Context

Transfer fees are stored as expense transactions and linked from `TransferPair.fee_transaction_id`. The transfer-deletion path already removes the pair and its fee, but ordinary transaction deletion currently does not check the fee reference.

## Decision

Before any deletion logic, query `TransferPair` for a row whose `fee_transaction_id` matches the authenticated user's transaction. Reject it with HTTP 400 and the selected error message. Keep whole-transfer deletion behavior unchanged.

Add a test that creates a transfer with a fee, attempts to delete the fee directly, and confirms the fee remains available.
