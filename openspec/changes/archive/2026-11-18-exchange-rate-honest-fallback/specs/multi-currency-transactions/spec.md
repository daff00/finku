## ADDED Requirements

### Requirement: Exchange rate responses identify stale data
The system SHALL identify whether a returned exchange rate is stale. If the provider cannot supply a rate and no cached rate exists for the requested currency pair, the API SHALL return HTTP 503 rather than an invented rate. If a cached rate is returned after a provider failure, the response SHALL mark it stale.

#### Scenario: Provider returns a fresh rate
- **WHEN** the exchange-rate provider successfully returns a rate
- **THEN** the API returns that rate with `is_stale` set to `false`

#### Scenario: Provider fails and a cached rate exists
- **WHEN** the provider fails and a cached rate exists for the requested currency pair
- **THEN** the API returns the cached rate with `is_stale` set to `true`

#### Scenario: Provider fails without a cached rate
- **WHEN** the provider fails and no cached rate exists for the requested currency pair
- **THEN** the API returns HTTP 503 with a clear error and no fabricated rate

#### Scenario: Analytics requires a USD conversion but no rate is available
- **WHEN** an analytics request includes USD-denominated values and the provider fails without a cached USD-to-IDR rate
- **THEN** the analytics API returns HTTP 503 rather than using a hardcoded conversion rate

### Requirement: Exchange-rate status is visible during currency conversion
The application SHALL make stale or unavailable exchange-rate status visible wherever the shared currency-display experience is used, and SHALL NOT present an unavailable conversion as a numeric amount.

#### Scenario: Stale rate is used for display conversion
- **WHEN** the API returns a cached exchange rate marked stale
- **THEN** the application displays a small `kurs lama` indicator

#### Scenario: No rate is available for display conversion
- **WHEN** no exchange rate is available
- **THEN** the application displays a small `kurs tidak tersedia` indicator and does not render a converted numeric amount
