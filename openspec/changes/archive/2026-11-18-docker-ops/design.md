## Context

See proposal.md for the motivation. The backend image already includes the application package, uses a named `/data` volume, and runs as UID 10001. The existing admin-key registration API is reachable through nginx.

## Goals / Non-Goals

**Goals:**
- Share one SQLite backup implementation between Bash and PowerShell wrappers.
- Keep backup files on the operator's host and avoid exposing database files in image layers.
- Make the initial-user and restore procedures usable from the single published frontend port.

**Non-Goals:**
- Automate scheduled backups, remote backup storage, encryption, or key rotation.
- Add a restore script or change the application registration API.

## Decisions

- Implement backup and restore operations in a small Python module included in the existing backend app image. It calls `Connection.backup` for live snapshots and validates a restore with `PRAGMA integrity_check` before atomically replacing the stopped database.
- Create the temporary snapshot under `/tmp` in the backend container, copy it to a timestamped host file with `docker compose cp`, then remove the container temporary file. The default destination is `backups/` under the repository root.
- Use `FINKU_BACKUP_KEEP` for retention in both scripts, defaulting to seven. Sort by UTC timestamped filenames so retention is deterministic.
- For restore, stop the backend, bind-mount the chosen host backup read-only into a one-off backend-image container with the named volume, atomically replace `finku.db`, remove SQLite WAL/SHM sidecars, and restart/check the stack.
- Document registration as a POST to `/api/v1/auth/register` through the nginx-published origin with `X-Admin-Key`; do not run `seed.py`.

## Risks / Trade-offs

- [The host may run out of disk space during backup] → Fail on command errors, preserve the original database, and keep only timestamped completed backups.
- [A restore can overwrite newer financial data] → Require an explicit backup path, stop the backend first, and document making a safety backup before replacement.
- [A host-side copy can fail after the temporary snapshot is created] → Surface errors and leave the temporary file for diagnosis rather than claiming success.
