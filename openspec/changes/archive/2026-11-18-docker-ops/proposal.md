## Why

The private deployment needs a safe way to provision its first user and protect its SQLite data during routine backups and restores. Operational steps should avoid seeding production or copying a live database file.

## What Changes

- Document first-user creation through the existing admin-key registration API via nginx.
- Add Bash and PowerShell backup scripts that call SQLite's online backup API inside the backend container, produce timestamped host-side files, and retain the newest seven by default.
- Document a restore procedure that stops the backend before replacing the database and verifies the restored deployment.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docker-deployment`: specify safe SQLite backup and restore behavior and the first-user provisioning procedure.

## Impact

- Root `scripts/` operational scripts and restore instructions.
- README deployment instructions and the `docker-deployment` capability specification.
