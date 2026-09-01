## Context

See proposal.md for the motivation. The product already has the core source-native currency model, shared display currency state, and multi-currency transaction support. The remaining design issue is not to add a new money model, but to enforce the invariants that make that model safe: report totals must convert before aggregation, balance states must never go negative, and outgoing financial actions must not exceed known funds.

## Goals / Non-Goals

**Goals:**
- Keep the source-native currency model working as-is for stored balances and transactions.
- Convert only at read/report time for the selected display currency.
- Prevent negative balances and insufficient-funds writes before commit.
- Preserve current USD/IDR flows while tightening the missing validation boundaries.

**Non-Goals:**
- Replacing the existing money model or currency storage schema.
- Expanding the app to additional currencies beyond the current IDR/USD support.
- Introducing a broad historical-rate system beyond the project’s existing exchange-rate flow.

## Decisions

### 1) Keep storage and display separate
The system maintains the account currency as the authoritative source of truth for each amount. The app display currency is a presentation feature only, and the conversion layer stays at analytics/rendering time. This preserves existing data integrity and prevents silent re-interpretation of stored values.

**Alternative considered:** Converting at write time to the app display currency. Rejected because it mutates the source data and breaks the model once the user switches views or reports.

### 2) Enforce safety checks in the API boundary
Negative balance checks and insufficient-funds validation belong in the backend transaction and balance routes, not in the frontend alone. This ensures the rules apply consistently even if a client bypasses validation or retries a request.

**Alternative considered:** Client-only validation. Rejected because it cannot protect the source of truth or enforce rules across all callers.

### 3) Report totals using a conversion-first accumulation rule
Net worth and summary analytics must convert account balances to the selected reporting currency before summing. This keeps totals meaningful even when the account mix includes USD and IDR.

**Alternative considered:** Summing raw values across currencies. Rejected because it produces false totals and hides conversion assumptions.

### 4) Treat zero balance as a valid state unless the business explicitly forbids it
The product requirement calls for “no negative balance,” not necessarily “must be positive.” This keeps the model realistic and avoids unnecessary restrictions on valid zero-balance accounts while still preventing invalid debt states.

**Alternative considered:** Forcing all balances to be strictly greater than zero. Rejected because it is a stronger business rule than the current requirement and would reject legitimate zero-balance accounts.

## Risks / Trade-offs

- [Display conversion drift] → If one screen still formats amounts without the shared conversion path, totals may disagree with the currency toggle. Mitigation: keep conversion in the central formatter and analytics layer.
- [Exchange-rate dependence] → Reporting totals rely on current conversion values. Mitigation: clearly scope the current display conversion to the active UI/reporting context and do not mutate stored data.
- [Insufficient-funds semantics] → Some legacy flows may have allowed overdrawn states. Mitigation: enforce the rule at the API boundary and validate the source account before mutation writes.

## Migration Plan

1. Confirm the current source-native currency rules remain the default for stored values.
2. Update analytics totals to convert balances into the active report currency before aggregation.
3. Add backend validation to reject negative balance states and insufficient-funds writes before commit.
4. Keep frontend display conversion tied to the active currency context rather than stored value mutation.
5. Validate the existing USD/IDR flows with targeted regression coverage for net worth, balances, transfer semantics, and error paths.

## Open Questions

- Whether the product wants to allow zero-balance accounts as a normal state across all workflows. The proposed design assumes zero is valid unless a stricter business rule is later introduced.
