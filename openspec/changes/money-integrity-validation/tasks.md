## 1. Validate the money invariants

- [ ] 1.1 Confirm the active display currency remains a reporting concern and never mutates stored amounts.
- [ ] 1.2 Lock the required business rules for net worth, non-negative balances, and insufficient funds.
- [ ] 1.3 Review existing API and analytics behavior to confirm the change stays within the intended USD/IDR scope.

## 2. Backend validation

- [ ] 2.1 Add negative-balance checks in the balance creation and update paths.
- [ ] 2.2 Add insufficient-funds validation before transfer and outgoing mutation writes.
- [ ] 2.3 Return clear API validation errors for invalid balance and fund shortage conditions.
- [ ] 2.4 Verify no partial writes occur when the validation fails.

## 3. Reporting and display conversion

- [ ] 3.1 Update net worth and summary aggregation to convert native values into the active app currency before summing.
- [ ] 3.2 Ensure account totals and dashboard displays follow the same conversion rule.
- [ ] 3.3 Confirm switching display currency does not rewrite stored source values.

## 4. Frontend regression checks

- [ ] 4.1 Validate the active currency toggle still works without altering saved account values.
- [ ] 4.2 Check that account summaries and net worth stay consistent when viewing IDR or USD.
- [ ] 4.3 Confirm transfer and deduction flows surface the correct insufficient-funds message to users.

## 5. Verification

- [ ] 5.1 Run the targeted backend tests covering balances, transactions, analytics, and transfer validation.
- [ ] 5.2 Smoke-test the affected UI flows in both display currencies.
- [ ] 5.3 Review the final change and confirm no working USD/IDR functionality was changed beyond the required guardrails.
