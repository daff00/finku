## MODIFIED Requirements

### Requirement: Global currency selection
The system SHALL provide a single user-visible currency preference that is shared across the app and used consistently for calculations, formatting, and transaction presentation.

#### Scenario: User switches currency from IDR to USD
- **WHEN** a user toggles the currency preference from IDR to USD
- **THEN** visible amounts across the app update to USD formatting using the current exchange rate

#### Scenario: User returns to IDR view
- **WHEN** a user toggles the currency back to IDR
- **THEN** amounts are displayed again in local currency format without retaining stale conversion assumptions

#### Scenario: Net worth reflects the active reporting currency
- **WHEN** the user changes the app display currency
- **THEN** net worth and account totals are recalculated in that display currency from the native account balances rather than from raw mixed-currency values

#### Scenario: Stored values remain source-native
- **WHEN** the app display currency changes
- **THEN** the underlying stored transaction and balance values are unchanged and only the presentation layer is converted

### Requirement: Correct currency conversion semantics
The system SHALL preserve the original transaction currency in the stored value and convert only at display time when the app is showing a different display currency.

#### Scenario: USD transaction remains USD in storage
- **WHEN** a user creates a transaction with a USD amount of 20
- **THEN** the stored transaction keeps its original currency metadata and is not silently reinterpreted as IDR or converted twice

#### Scenario: Display converts only once
- **WHEN** the app is in USD display mode
- **THEN** the transaction remains shown as 20.00 USD without dividing by the exchange rate again

#### Scenario: Switching to IDR display converts from source currency
- **WHEN** the app currency toggles to IDR while a USD transaction is displayed
- **THEN** the value is converted from the transaction's source currency into IDR for display and the underlying source value remains unchanged

#### Scenario: Reporting totals never sum raw mixed values
- **WHEN** an account balance or transaction total is combined across currencies for reporting
- **THEN** each amount is converted into the selected reporting currency before aggregation

## ADDED Requirements

### Requirement: Balance safety and funds validation
The system SHALL prevent invalid balance states and reject financial mutations that would exceed the available source funds.

#### Scenario: Negative balance is rejected
- **WHEN** a balance snapshot, balance update, or settlement action would create a negative amount
- **THEN** the system rejects the change and returns a clear validation error

#### Scenario: Balance amount cannot be invalidly set below zero
- **WHEN** a client submits a balance value or mutation that resolves to a negative balance
- **THEN** the system rejects the request before any data is committed

#### Scenario: Source account funds are checked before transfer or deduction
- **WHEN** a transfer, withdrawal, or other outgoing money event is submitted
- **THEN** the system verifies the source account balance before commit and rejects the request if the outgoing amount exceeds available funds

#### Scenario: Insufficient funds produces a clear error
- **WHEN** a user attempts a transfer or mutation without enough balance in the source account
- **THEN** the API returns an explicit insufficient-funds validation error and no partial write is committed
