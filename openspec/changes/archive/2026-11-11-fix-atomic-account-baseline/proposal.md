## Why

Account creation currently commits the account before its zero balance snapshot. A failure between those commits leaves a durable account without the baseline required by balance and net-worth calculations.

## What Changes

- Persist the account and its epoch-dated zero baseline in one database transaction.
- Verify successful creation produces both records and a baseline-write failure leaves neither persisted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `balance-snapshots`: Require account creation to persist its zero baseline atomically.

## Impact

- `backend/app/api/routes/accounts.py`
- `backend/tests/test_accounts.py`
- Balance snapshot behavior and its OpenSpec contract.
