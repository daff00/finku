## 1. Shared Currency State

- [x] 1.1 Confirm the existing `CurrencyProvider` and `useCurrency` hook remain the single source of truth for app-wide display currency selection.
- [x] 1.2 Move the toggle into the shared app layout so it is available on all routed pages without page-specific duplication.
- [x] 1.3 Ensure the toggle persists user preference in local storage and uses the existing exchange-rate hook consistently.

## 2. Currency-Aware Display

- [x] 2.1 Refactor transaction row rendering to use `useCurrency().formatAmount()` instead of direct `formatIDR()` calls.
- [x] 2.2 Update the transaction list and grouped date view to render amounts through the shared formatter.
- [x] 2.3 Update dashboard summaries and account metrics to use the active app currency without reintroducing hardcoded IDR logic.
- [x] 2.4 Audit remaining amount-rendering components for direct IDR assumptions and centralize them through the shared formatter.
- [x] 2.5 Confirm `formatAmount` receives the transaction/account source currency and never assumes a global single-currency format for display.

## 3. Transaction Creation and Validation

- [x] 3.1 Add a visible currency selector to the add-transaction sheet and tie it to the account's native currency where appropriate.
- [x] 3.2 Remove the hardcoded `CurrencyEnum.IDR` default from the create-transaction payload and submit the selected currency.
- [x] 3.3 Preserve the backend-supported original amount/original currency fields when USD conversion context is relevant.
- [x] 3.4 Fix the conversion semantics bug: a transaction created as USD must remain in USD on storage and only be converted at display time when the app is switched to a different display currency.
- [x] 3.5 Enforce server-side validation so normal transaction writes derive currency from the account and reject mismatched client-submitted currency values.
- [x] 3.6 Add a regression test covering USD income created against a USD account and verify the stored transaction remains in USD.

## 4. Transfer Semantics

- [x] 4.1 Define same-currency transfer behavior as a simple amount move with no conversion.
- [x] 4.2 Define cross-currency transfer behavior as an exchange with separate source and destination amounts and a stored rate applied.
- [x] 4.3 Extend transfer schema and model support for `from_amount`, `to_amount`, and `rate_applied` (or equivalent) where currencies differ.
- [x] 4.4 Decide whether cross-currency transfers remain in the current `/transfer` endpoint or require a dedicated exchange flow.
- [x] 4.5 Add regression tests for same-currency and cross-currency transfer behavior.

## 5. Reporting and Aggregation

- [x] 5.1 Define a reporting base currency for net worth and dashboard totals (default: IDR unless product requirements change).
- [x] 5.2 Ensure current net worth converts account balances using the current rate instead of raw-summing mixed currencies.
- [x] 5.3 Ensure historical monthly summaries use the relevant rate for the period, not the current live rate on report generation.
- [x] 5.4 Scope category totals to a single currency or convert and label mixed-currency totals explicitly when mixing is required.
- [x] 5.5 Add regression checks for mixed-currency account aggregation and category totals.

## 6. Account Identity and Dedupe

- [x] 6.1 Include currency as part of the duplicate-account decision when evaluating account identity.
- [x] 6.2 Ensure an IDR and USD account with the same name/bank/type are not collapsed into one logical account in the dedupe logic.

## 7. Cleanup and Verification

- [x] 7.1 Keep formatting logic in shared utilities instead of duplicating conversion code in view components.
- [x] 7.2 Verify no frontend component is directly calling `formatIDR()` for transaction amounts when it should follow the global currency context.
- [x] 7.3 Run the relevant frontend validation checks and confirm the app behavior is consistent across the dashboard and transactions flow.
- [x] 7.4 Verify that a stored USD transaction displays as 20 USD, and when the app switches to IDR it converts from the original USD value instead of showing a misinterpreted raw amount.
- [x] 7.5 Validate the stricter backend invariants and transfer/reporting rules with targeted regression tests before moving on.

Validation evidence: `cd "d:\Coding\Project\Finku\backend"; .\.venv\Scripts\python.exe -m pytest tests/test_analytics.py tests/test_transactions.py -q` → `41 passed in 16.08s`.
