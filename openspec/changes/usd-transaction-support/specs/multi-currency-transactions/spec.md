## Purpose

Provides a consistent multi-currency experience for transactions so the app can display and create values in IDR or USD without inconsistent formatting or hidden assumptions.

## ADDED Requirements

### Requirement: Global currency selection
The system SHALL provide a single user-visible currency preference that is shared across the app and used consistently for calculations, formatting, and transaction presentation.

#### Scenario: User switches currency from IDR to USD
- **WHEN** a user toggles the currency preference from IDR to USD
- **THEN** visible amounts across the app update to USD formatting using the current exchange rate

#### Scenario: User returns to IDR view
- **WHEN** a user toggles the currency back to IDR
- **THEN** amounts are displayed again in local currency format without retaining stale conversion assumptions

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

### Requirement: Shared formatting logic
The system SHALL centralize amount conversion and formatting in one shared formatter so repeated page-level logic does not drift across screens.

#### Scenario: Formatting behavior is reused
- **WHEN** multiple screens render amounts in the same app context
- **THEN** they call the same shared formatting path instead of duplicating local conversion rules
