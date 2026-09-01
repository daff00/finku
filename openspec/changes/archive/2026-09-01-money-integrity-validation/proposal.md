## Why

The app already supports the core USD/IDR model, but the remaining money-integrity rules are still inconsistent: net worth can be misleading when account values from different currencies are mixed without conversion, balance mutations do not yet guard against negative balances, and transfer or deduction flows can proceed even when funds are insufficient. The next step is to preserve the working source-native currency behavior while tightening the guardrails around reporting, balance safety, and funds validation.

## What Changes

- Require net worth and account summary reporting to convert native account values into the active display currency instead of summing raw cross-currency values.
- Prevent negative balances from being created or persisted, and reject any mutation that would reduce an account below zero.
- Validate transfer and deduction flows against source-account availability before committing a write, returning a clear insufficient-funds error.
- Keep stored transaction and balance values in their native account currency; conversion remains a reporting/display concern rather than a write-time rewrite.
- Keep the current USD/IDR support working as-is except where these integrity checks require tighter validation.

## Capabilities

### New Capabilities
- Empty

### Modified Capabilities
- `multi-currency-transactions`: extend the existing multi-currency behavior with display-safe reporting, non-negative balance enforcement, and insufficient-funds validation while preserving the source-native money model.

## Impact

- Backend analytics, balance creation, and transaction/transfer validation flows.
- Frontend display calculations and currency conversion for net worth and account totals.
- Existing USD/IDR transaction and transfer behavior must remain stable; only the missing validation and reporting correctness rules change.
- Error handling and client-facing validation messaging for balance and transfer safety.
