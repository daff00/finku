## Why

When the external rate provider fails before a cache is available, the API currently supplies a hardcoded exchange rate that can misstate reported balances and net worth. Users need to distinguish unavailable rates and stale cached rates from fresh rates.

## What Changes

- Remove the invented fallback rate and return HTTP 503 when neither a provider rate nor cached rate is available.
- Mark stale cached rates explicitly in the API response, and expose that state in the frontend.
- Remove the hardcoded analytics conversion rate so USD-denominated totals use the same provider/cache policy.
- Keep the existing exchange-rate provider and align documentation with its actual use.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `multi-currency-transactions`: define honest exchange-rate failure behavior and visible stale/unavailable status.

## Impact

- Backend exchange-rate and analytics routes, response schema, and tests.
- Frontend exchange-rate type and shared currency-display status.
- Exchange-rate documentation.
