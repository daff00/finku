## Why

The database records outbound and inbound transfer direction, but API responses and frontend types omit it. This prevents clients from consistently identifying transfer legs, and seeded transfers do not populate the field.

## What Changes

- Include transaction direction in the backend response schema and frontend `Transaction` type.
- Set `OUT` and `IN` on all seeded transfer legs.
- Verify API responses expose both directions and use `null` for ordinary transactions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `multi-currency-transactions`: Expose transfer direction consistently in transaction contracts.

## Impact

- `backend/app/schemas/schemas.py`
- `frontend/src/types/index.ts`
- `backend/seed.py`
- Transaction API tests
