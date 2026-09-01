## Context

See proposal.md for motivation. The application already contains a partial global currency setup and an exchange-rate hook, but the actual runtime behavior is inconsistent: the toggle is only mounted in one page, several transaction views still call IDR-specific formatters directly, and the add-transaction dialog can still be shaped by the active app currency rather than the account's actual native currency. The backend data model already includes a `currency` field, but the real design requirement is broader: currency must be treated as a business invariant, not merely a UI decoration.

## Goals / Non-Goals

**Goals:**
- Provide a single app-wide currency preference available across the main layout.
- Render transaction amounts, account balances, and summary values through the same shared formatting path.
- Allow manual transaction creation in either IDR or USD without hardcoded defaults.
- Ensure transactions are stored in the account's native currency and never converted on write.
- Support same-currency and cross-currency transfer semantics with explicit exchange metadata.
- Aggregate net worth and analytics in a reporting base currency without raw-summing mixed currencies.
- Prevent duplicate account definitions from being treated as equivalent when their currencies differ.
- Reduce duplicated formatting logic and keep screens easier to maintain.

**Non-Goals:**
- Rebuilding the entire app or replacing the exchange-rate provider from scratch.
- Enabling every possible international-currency flow in this phase; focus stays on the existing IDR/USD problem set.
- Introducing a full historical-rate warehouse beyond the project's existing rate model; the design requires at least monthly or per-transaction rate snapshots where cross-currency reporting depends on them.

## Decisions

### 1) Use the existing currency context as the source of truth for display only
The app already has a `CurrencyProvider` and `useCurrency()` hook. The design keeps this as the single place where the app display currency state, exchange-rate data, and formatting conversion logic live for view rendering. This avoids multiple parallel ways of formatting amounts and keeps toggling behavior consistent across screens.

**Alternative considered:** Local per-page currency state. Rejected because it would create drift and inconsistent values across the app.

### 2) Treat account currency as the canonical transaction currency
Every transaction must be associated with an account, and the account's native `currency` is the authoritative value for the transaction amount. If a client submits a different currency, the request must be rejected or ignored server-side. The safest design is to derive the transaction `currency` from the target account on the server and never accept a client-supplied currency field for a normal transaction write.

**Alternative considered:** Letting clients choose a transaction currency independently. Rejected because it creates the exact class of silent data corruption now seen in mixed-currency flows.

### 3) Design transfers as exchange events, not as a single shared amount
Same-currency transfers remain as a single amount moving from one account to another. Cross-currency transfers need to be represented as a true exchange with separate debit/credit values and the rate that was applied at the time of transfer.

This means the transfer schema must support fields such as:
- `from_amount`
- `to_amount`
- `rate_applied`
- the original/source and destination currencies

The existing `TransferPair` model assumption that both legs share one common `amount` is incompatible with cross-currency transfer semantics and must be redesigned or extended.

**Alternative considered:** Reusing a single shared amount on both legs. Rejected because it incorrectly implies the same value represents both sides of a different-currency exchange.

### 4) Use a reporting base currency for aggregation across accounts
The app must not sum raw amounts from USD and IDR as if they were the same currency. Net worth and analytics should convert account balances and transaction totals into a chosen reporting base (IDR is the natural default in this project) using current or historical rates depending on the report.

- Current net worth: use current conversion rate.
- Historical monthly summaries: use the rate that was in effect for the relevant period or a stored monthly average rate, not the live rate of the day the report is viewed.
- Category totals: either scope to a single currency or convert and label them explicitly whenever mixed-currency data is included.

**Alternative considered:** Summing raw values across currencies. Rejected because it produces meaningless totals and hides conversion assumptions.

### 5) Keep the app-level display choice separate from stored source currency
The formatter must know both the raw amount and the source currency, then apply the active display currency only at rendering time. This keeps a USD transaction as USD in storage, prevents double conversion, and makes the app switch between IDR/USD display modes without corrupting the underlying data.

**Alternative considered:** Reinterpreting stored amounts based on the active display mode. Rejected because it converts the wrong object and creates the near-zero/incorrect-IDR bug seen in the current flow.

### 6) Include currency in account dedupe rules
The account-creation flow must treat currency as part of the duplicate identity when evaluating whether two accounts represent the same logical account. A BCA Savings account in IDR and a BCA Savings account in USD should not collapse into a single account if that scenario is possible in user workflows.

## Risks / Trade-offs

- [Exchange rate dependency] → The app relies on the exchange-rate hook; if the upstream service is unavailable, the formatter falls back gracefully and historical reporting must not silently recalculate using a different rate than the one actually used.
- [Mixed display semantics] → Some screens may still assume raw amounts are always IDR unless they adopt the shared formatter; mitigation is to refactor all transaction-based rendering through the centralized currency provider and per-account source currency.
- [Historical reporting drift] → If monthly analytics use today's rate instead of historical or monthly average rates, the totals will appear to change over time; mitigation is to store or compute/report the rate used for each period.
- [Cross-currency transfer complexity] → The transfer model becomes more complex when it represents exchange events; this is a necessary trade-off to maintain accurate accounting.

## Migration Plan

1. Add the shared toggle to the app shell and keep the existing provider and hook in place.
2. Refactor transaction row and list rendering to use the shared formatter with source-aware currency logic.
3. Update dashboard/account summary display to use the account's native currency and active display settings without reinterpreting raw values.
4. Update the add-transaction form to follow the selected account's currency and keep the stored value in that native currency.
5. Add backend validation that derives transaction currency from the account and rejects mismatched payload values.
6. Extend the transfer model to support same-currency and cross-currency exchange semantics with explicit exchange metadata.
7. Update net worth and analytics aggregation to convert to a reporting base currency using current or historical rates.
8. Audit account duplication rules to include currency as part of account identity.
9. Run the existing frontend and backend checks and smoke-test the affected screens.

## Open Questions

- Whether cross-currency transfers are exposed through the existing `/transfer` endpoint or should be split into a distinct exchange-oriented endpoint.
- Which reporting base currency should be used for multi-currency summaries once the product becomes more explicit about IDR-first reporting versus dual-currency operation.
- Whether historical rates should be stored as a monthly snapshot, a rate table, or derived from a fixed exchange-rate service granted the needed metadata.
