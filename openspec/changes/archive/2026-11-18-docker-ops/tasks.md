## 1. Backup tooling

- [x] 1.1 Add a shared backend CLI that snapshots SQLite with `Connection.backup` and a focused unit test.
- [x] 1.2 Add `scripts/backup.sh` with timestamped host output and configurable retention defaulting to seven.
- [x] 1.3 Add `scripts/backup.ps1` with the same snapshot and retention behavior.
- [x] 1.4 Add `.gitattributes` to enforce LF endings for shell scripts.

## 2. First user and restore

- [x] 2.1 Document creating the first user through the nginx-published admin-key registration endpoint without running `seed.py`.
- [x] 2.2 Add `scripts/restore.md` with safe restore steps that stop the backend before replacing the SQLite file.
- [x] 2.3 Exercise backup and restore into a fresh isolated Compose volume and confirm the user data survives.

## 3. Validation

- [x] 3.1 Run focused backup tests, backend tests, and strict OpenSpec validation.
