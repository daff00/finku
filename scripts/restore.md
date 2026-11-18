# Restore a Docker SQLite backup

Run these commands from the repository root. Confirm that `backend/.env` and the Compose interpolation secrets are available before starting; the one-off restore container uses the same backend image and named data volume as the deployment.

1. Choose a timestamped backup under `backups/`. If the current database may contain newer data, create a fresh backup first.
2. Stop the API before replacing the SQLite file:

   ```powershell
   docker compose stop backend
   if ($LASTEXITCODE -ne 0) { throw "Could not stop backend" }
   ```

3. Restore the selected file. Replace the filename with the backup you chose:

   ```powershell
   $Backup = (Resolve-Path (Read-Host "Full path to the selected backup")).Path
   docker compose run --rm -T --no-deps `
     --volume "${Backup}:/tmp/finku-restore.db:ro" `
     --entrypoint python backend `
     -m app.core.sqlite_backup `
     --restore --source /tmp/finku-restore.db --destination /data/finku.db
   if ($LASTEXITCODE -ne 0) { throw "Database restore failed" }
   ```

   The restore validates the backup with SQLite's integrity check, writes it to a temporary file on the named volume, removes stale WAL/SHM sidecars, and atomically replaces `finku.db`. An invalid backup leaves the existing database unchanged.

4. Restart and verify the deployment:

   ```powershell
   docker compose up -d backend frontend
   if ($LASTEXITCODE -ne 0) { throw "Could not restart the deployment" }
   docker compose ps
   curl.exe --fail http://localhost:8080/health
   ```

The migration service may run again during startup; it does not seed data. Keep the selected backup until the application has been checked.
