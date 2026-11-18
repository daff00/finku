## Context

See proposal.md for the motivation. Exchange rates are currently fetched from exchangerate-api.com and cached in a single in-memory slot for 24 hours. API responses are assembled in the route, while frontend amount conversion is shared by CurrencyContext.

## Goals / Non-Goals

**Goals:**
- Keep the current provider and cache lifecycle while making rate freshness explicit.
- Keep unavailable conversions from appearing as numeric zero or using an earlier query value after a failed request.

**Non-Goals:**
- Changing providers, introducing persistent caching, or redesigning the app's currency conversion model.

## Decisions

- Add a typed exchange-rate response with a required `is_stale` boolean, false for successful provider results and true only when an eligible cached rate is used. Return HTTP 503 when provider failure leaves no eligible cached rate.
- Have analytics resolve a USD-to-IDR rate through the same provider and cache path only when the requested calculation contains USD values; propagate unavailability rather than using a static estimate.
- Preserve the provider's error detail as the API error while ensuring unavailable rates do not serialize as success-shaped JSON.
- Derive a shared frontend rate status from the exchange-rate query and display one small status indicator in the shared authenticated app shell. When a request errors, do not use retained query data for conversions.
- Treat the one-slot cache as eligible only for the same currency pair, avoiding stale values being mislabeled as rates for another pair.

## Risks / Trade-offs

- A transient provider outage without server cache now causes USD display conversions to be unavailable instead of displaying an approximate value; this is intentional and explicitly indicated in the UI.
- The status indicator is shared at the app shell rather than repeated next to every amount, keeping the shared-formatting design consistent while making conversion status visible across app screens.
