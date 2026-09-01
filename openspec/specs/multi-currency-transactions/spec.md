# multi-currency-transactions Specification

## Purpose
Provides a consistent multi-currency experience for transactions so the app can display and create values in IDR or USD without inconsistent formatting or hidden assumptions.

## Requirements

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

### Requirement: Currency-aware transaction display
The system SHALL format transaction and summary amounts according to the current app currency instead of hardcoded IDR-only formatting.

#### Scenario: Transaction list displays USD values
- **WHEN** a user views transactions while the app currency is USD
- **THEN** each transaction amount is shown in USD using the active rate and current display settings

#### Scenario: Dashboard totals use the active currency
- **WHEN** the app currency is USD
- **THEN** net worth and spend summaries are rendered in USD and still preserve the same logical totals

### Requirement: Currency-aware transaction creation
The system SHALL allow users to create transactions in either IDR or USD and persist the selected currency on the transaction record.

#### Scenario: User creates an expense in USD
- **WHEN** a user enters a USD transaction in the add-transaction form
- **THEN** the submitted payload stores the chosen currency and the transaction is created with the correct value and metadata

#### Scenario: User creates an expense in IDR
- **WHEN** a user creates an IDR transaction
- **THEN** the transaction retains IDR formatting and does not unnecessarily convert or re-label the value

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

### Requirement: Shared formatting logic
The system SHALL centralize amount conversion and formatting in one shared formatter so repeated page-level logic does not drift across screens.

#### Scenario: Formatting behavior is reused
- **WHEN** multiple screens render amounts in the same app context
- **THEN** they call the same shared formatting path instead of duplicating local conversion rules

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
