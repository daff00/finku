## Context

`Transaction.direction` is already persisted in the model and set for API-created transfers, but `TransactionOut` and the TypeScript `Transaction` contract omit it. Seed transfer legs also use the shared helper without setting direction.

## Decision

Type the response field as `TransferDirectionEnum | None` in Pydantic and as `"OUT" | "IN" | null` in TypeScript. Add an optional direction argument to the seed helper and explicitly set it on each transfer leg. Keep direction null for normal transaction creation.

Extend transaction tests to assert the response contract for transfer and ordinary transaction rows.
