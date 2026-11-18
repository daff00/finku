## 1. Backend exchange-rate contract

- [x] 1.1 Add a typed exchange-rate response with `is_stale`, return fresh and stale states accurately, and return 503 when no same-pair cache is available.
- [x] 1.2 Add focused tests for fresh provider results, stale cache fallback, and unavailable-rate 503 behavior.
- [x] 1.3 Replace the analytics hardcoded conversion rate with the shared provider/cache policy and cover both conversion and unavailable-rate behavior.

## 2. Frontend conversion status

- [x] 2.1 Expose fresh, stale, and unavailable rate status through the shared currency context and prevent conversion using retained data after a failed request.
- [x] 2.2 Show a small Tailwind-token-based `kurs lama` or `kurs tidak tersedia` indicator in the shared application shell.

## 3. Verification and provider documentation

- [x] 3.1 Run the full backend test suite and frontend build and tests.
- [x] 3.2 Confirm the provider remains exchangerate-api.com and update the exchange-rate documentation to remove the hardcoded fallback claim.
