## Context

`backend/seed.py` creates the user `admin` with password `admin` and currently has no environment guard or development-only warning.

## Decision

Check `ENVIRONMENT` at the very beginning of `seed()`, before any writes. In production, print an error and exit with status 1. Otherwise, warn that the script seeds development data and accurately report the current default credentials. Add `ENVIRONMENT=development` to `.env.example`.

Test only the production guard path so tests never seed the configured database.
