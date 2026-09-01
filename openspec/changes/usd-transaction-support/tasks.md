## 1. Shared Currency State

- [ ] 1.1 Confirm the existing `CurrencyProvider` and `useCurrency` hook remain the single source of truth for app-wide currency selection.
- [ ] 1.2 Move the toggle into the shared app layout so it is available on all routed pages without page-specific duplication.
- [ ] 1.3 Ensure the toggle persists user preference in local storage and uses the existing exchange-rate hook consistently.

## 2. Currency-Aware Display

- [ ] 2.1 Refactor transaction row rendering to use `useCurrency().formatAmount()` instead of direct `formatIDR()` calls.
- [ ] 2.2 Update the transaction list and grouped date view to render amounts through the shared formatter.
- [ ] 2.3 Update dashboard summaries and account metrics to use the active app currency without reintroducing hardcoded IDR logic.
- [ ] 2.4 Audit remaining amount-rendering components for direct IDR assumptions and centralize them through the shared formatter.

## 3. Transaction Creation Flow

- [ ] 3.1 Add a visible currency selector to the add-transaction sheet and tie it to the active app preference.
- [ ] 3.2 Remove the hardcoded `CurrencyEnum.IDR` default from the create-transaction payload and submit the selected currency.
- [ ] 3.3 Preserve the backend-supported original amount/original currency fields when USD conversion context is relevant.
- [ ] 3.4 Smoke-test the create-transaction flow for both IDR and USD paths.

## 4. Cleanup and Verification

- [ ] 4.1 Keep formatting logic in shared utilities instead of duplicating conversion code in view components.
- [ ] 4.2 Verify no frontend component is directly calling `formatIDR()` for transaction amounts when it should follow the global currency context.
- [ ] 4.3 Run the relevant frontend validation checks and confirm the app behavior is consistent across the dashboard and transactions flow.
