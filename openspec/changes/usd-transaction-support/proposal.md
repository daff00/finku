## Why

The app already has a partial USD display flow, but the current implementation is inconsistent: the toggle is only mounted in the dashboard, the transaction list still formats amounts in IDR, and the add-transaction form always creates IDR entries. This leaves the app unable to present a coherent multi-currency experience and makes USD support feel incomplete even though the backend data model already supports it.

## What Changes

- Introduce a consistent multi-currency experience across the app using a shared currency provider and formatter.
- Ensure the global currency toggle is available across the main layout, not only on the dashboard.
- Update transaction display logic to render amounts in the selected currency without hardcoded IDR formatting.
- Allow manual transaction creation to select USD or IDR and persist the selected currency correctly.
- Keep formatting and conversion logic centralized to avoid repeated ad hoc logic and reduce long page-level code duplication.

## Capabilities

### New Capabilities
- `multi-currency-transactions`: add shared currency selection and formatting behavior for transaction data, dashboard summaries, and transaction creation flows.

### Modified Capabilities
- Empty

## Impact

- Frontend currency display and formatting across dashboard, transactions, and analytics views.
- Transaction creation and editing flows in the add transaction sheet and transaction list UI.
- Shared state and global formatting logic in the app shell and currency context.
- Potential API contract alignment for currency fields already supported by the backend (`currency`, `original_amount`, `original_currency`).
