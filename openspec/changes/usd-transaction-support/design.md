## Context

See proposal.md for motivation. The application already contains a partial global currency setup and an exchange-rate hook, but the actual runtime behavior is inconsistent: the toggle is only mounted in one page, several transaction views still call IDR-specific formatters directly, and the add-transaction dialog always creates IDR transactions. The backend already supports a `currency` field and exchange-rate endpoints, so the design should focus on unifying the frontend behavior around a single shared standard rather than expanding the backend contract.

## Goals / Non-Goals

**Goals:**
- Provide a single app-wide currency preference available across the main layout.
- Render transaction amounts, account balances, and summary values through the same shared formatting path.
- Allow manual transaction creation in either IDR or USD without hardcoded defaults.
- Reduce duplicated formatting logic and keep screens easier to maintain.

**Non-Goals:**
- Reworking the backend data model beyond the existing `currency` support already in place.
- Introducing a new exchange-rate provider or backend-only conversion layer.
- Rebuilding unrelated analytics or settings pages as part of the currency work.

## Decisions

### 1) Use the existing currency context as the source of truth
The app already has a `CurrencyProvider` and `useCurrency()` hook. The design keeps this as the single place where the app currency state, exchange-rate data, and formatting conversion logic live. This avoids multiple parallel ways of formatting amounts and keeps toggling behavior consistent across screens.

**Alternative considered:** Local per-page currency state. Rejected because it would create drift and inconsistent values across the app.

### 2) Move the currency toggle to the shared app shell
The toggle should be rendered in the shared layout rather than only on the dashboard. This makes the preference global and ensures that every page shares the same state without extra wiring.

**Alternative considered:** Keeping the toggle pinned to the dashboard. Rejected because it fragments the experience and makes the feature appear optional or page-specific.

### 3) Centralize display conversion logic rather than mixing raw formatting helpers
The design uses `formatAmount()` for UI rendering while leaving raw backend values as string-based amounts as required by the project. This reduces the number of places that need to know about the USD conversion math and prevents IDR assumptions from being reintroduced in one-off components.

**Alternative considered:** Converting values inside each component. Rejected because it duplicates logic and makes maintenance harder.

### 4) Make the transaction creation form explicitly currency-aware
The add-transaction form should not default to `CurrencyEnum.IDR` in every case. It should accept the active app currency and send the correct value as part of the payload, while preserving the backend fields already supported for original amount and original currency when needed.

**Alternative considered:** Hardcoding transaction creation to IDR. Rejected because it prevents the feature from working despite backend support.

## Risks / Trade-offs

- [Exchange rate dependency] → The app relies on the exchange-rate hook; if the upstream service is unavailable, the formatter falls back gracefully to the cached or fallback rate.
- [Mixed display semantics] → Some screens may still assume raw amounts are always IDR unless they adopt the shared formatter; mitigation is to refactor all transaction-based rendering through the centralized currency provider.
- [Form data semantics] → If USD transactions are created without clear original-currency metadata, downstream reporting could become ambiguous; mitigation is to persist the chosen currency explicitly and keep optional original fields available when conversion context matters.

## Migration Plan

1. Add the shared toggle to the app shell and keep the existing provider and hook in place.
2. Refactor transaction row and list rendering to use the shared formatter.
3. Update dashboard/account summary display to use the same conversion path.
4. Update the add-transaction form to use the active app currency instead of a hardcoded IDR default.
5. Run the existing frontend checks and smoke-test the affected screens.

## Open Questions

- None at this stage; the required behavior is clear enough to proceed with implementation planning.
