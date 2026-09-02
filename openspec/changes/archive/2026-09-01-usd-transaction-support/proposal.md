## Why

The app already has a partial USD display flow, but the current implementation is inconsistent: the toggle is only mounted in the dashboard, some amount display paths still assume IDR, and the transaction creation flow can still be shaped by the active app currency rather than by the account's actual native currency. This leaves the app unable to present a coherent multi-currency experience and creates silent risk in data integrity, especially for mixed-currency account balances and transfers.

The real requirement is not only a display toggle. It is a set of invariants for money handling: every transaction must be stored in the account's native currency, transfers must represent real exchange events when currencies differ, and reporting must never silently add raw numbers from different currencies. Without these rules, the app can look functional while generating inconsistent financial records.

## What Changes

- Introduce a consistent multi-currency experience across the app using a shared currency provider and formatter.
- Ensure the global currency toggle is available across the main layout, not only on the dashboard.
- Update transaction display logic to render amounts in the selected currency without hardcoded IDR formatting.
- Allow manual transaction creation to select USD or IDR and persist the selected currency correctly.
- Enforce that transaction amounts are stored in the account's native currency, never converted on write.
- Treat transfers as exchange events when accounts have different currencies, storing source/destination amounts and the rate applied.
- Ensure net worth, monthly summaries, and category totals aggregate in a reporting base currency with explicit conversion rules instead of raw cross-currency summation.
- Include account-creation dedupe rules that consider currency as part of the identity, and keep formatting currency-aware per account and per source value.
- Keep formatting and conversion logic centralized to avoid repeated ad hoc logic and reduce long page-level code duplication.

## Capabilities

### New Capabilities
- `multi-currency-transactions`: add shared currency selection and formatting behavior for transaction data, dashboard summaries, and transaction creation flows.
- `transaction-currency-integrity`: require transactions to be stored in the native currency of their account and reject mismatched client-supplied currency values.
- `cross-currency-transfer-model`: support both same-currency transfers and modeled exchange events for different-currency transfers.
- `currency-safe-analytics`: aggregate account and category totals in a reporting currency rather than blindly summing raw values across currencies.

### Modified Capabilities
- Empty

## Impact

- Frontend currency display and formatting across dashboard, transactions, and analytics views.
- Transaction creation and editing flows in the add transaction sheet and transaction list UI.
- Shared state and global formatting logic in the app shell and currency context.
- Backend API validations for transactions, transfers, and account creation flows.
- Net worth and analytics aggregation logic across accounts with mixed currencies.
- Data model and schema design for transfer exchange metadata and historical reporting rates.
