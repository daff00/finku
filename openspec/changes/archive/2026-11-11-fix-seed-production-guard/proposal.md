## Why

The database seed script creates a development account with weak credentials. Running it with production configuration could introduce an insecure account and development data into a production database.

## What Changes

- Refuse to run the seed function when `ENVIRONMENT=production`.
- Warn that the script is for development data only and state the actual default credentials (`admin / admin`).
- Document `ENVIRONMENT=development` in the backend environment template.
- Test that production mode exits before seeding.

## Capabilities

### New Capabilities

- `seed-environment-guard`: Prevent development seeding in production.

### Modified Capabilities

None.

## Impact

- `backend/seed.py`
- `backend/.env.example`
- `backend/tests/test_seed.py`
