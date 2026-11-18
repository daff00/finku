# 💰 Finku — Personal Finance Tracker

> A personal budget & net worth tracker that aggregates Indonesian bank accounts and multi-currency assets into one clean dashboard. Designed with Japanese minimalism and self-hosted privacy: financial data stays on your server; exchange-rate lookups use an external provider.

## Features
- 📊 **Current net worth** across accounts with balance snapshots and dynamic transaction deltas
- 🏦 **Bank support**: BCA ✅ | Mandiri, Seabank, Bank Jago (coming soon)
- 💵 **Multi-currency support**: IDR and USD accounts with cached exchange rates fetched from an external provider
- 📥 **Statement import**: PDF import with auto-categorization (BCA currently supported)
- ✍️ **Transaction management**: Full CRUD, search, bank & category filtering, and transfer pairing
- 📈 **Monthly analytics**: Cashflow trends, category breakdown, account spending, and net worth charts
- 🌓 **Dark mode**: Japanese minimalist sumi-ink dark theme with persistent user preference, controlled from the shared app header
- 🔒 **Privacy-first & invite-only**: Self-hosted on local network / home server; strictly admin-provisioned access with no public registration

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind v4, shadcn/ui, TanStack Query v5, React Router v7 |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic, slowapi, loguru, uv |
| Database | SQLite (PostgreSQL migration path not yet validated) |

## Project Structure
```
finku/
├── frontend/   # React client
├── backend/    # FastAPI REST API
└── openspec/   # Specification-driven development changes and capabilities
```

## Run with Docker

Docker Compose runs the production frontend and backend with SQLite persisted in the named `finku-data` volume. Docker Compose is the recommended home-server deployment; it does not run `seed.py`.

### Configure

From the repository root, copy the templates once. The root `.env` supplies the three required Compose secrets; `backend/.env` supplies backend runtime settings such as the allowed browser origin.

PowerShell:
```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path backend\.env)) { Copy-Item backend\.env.example backend\.env }
```

Linux/macOS:
```bash
test -f .env || cp .env.example .env
test -f backend/.env || cp backend/.env.example backend/.env
```

Set distinct, randomly generated values for `SECRET_KEY`, `JWT_SECRET_KEY`, and `ADMIN_SECRET_KEY` in the root `.env`; do not commit either `.env` file. For example, in PowerShell this prints three independent 48-byte random values to copy into those fields:

```powershell
$Rng = [Security.Cryptography.RandomNumberGenerator]::Create()
1..3 | ForEach-Object {
  $Bytes = New-Object byte[] 48
  $Rng.GetBytes($Bytes)
  [Convert]::ToBase64String($Bytes)
}
$Rng.Dispose()
```

On Linux with OpenSSL installed, this prints named values ready to paste into `.env`:
```bash
for key in SECRET_KEY JWT_SECRET_KEY ADMIN_SECRET_KEY; do
  printf '%s=' "$key"
  openssl rand -base64 48
done
```

Replace the example hostname in `backend/.env`'s `ALLOWED_ORIGINS` with the deployed origin. For local use, `http://localhost:8080` is sufficient. The published frontend port defaults to `8080`; set `FINKU_PORT` in the root `.env` to change it.

### Start and check

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8080/health
```

On Windows, use `curl.exe http://localhost:8080/health`. The `migrate` service applies Alembic migrations before the backend starts. Only the frontend port is published; the backend listens behind nginx.

### Provision the first user

Register through the nginx-published origin. Enter the admin key configured in the root `.env` and choose a strong user password when prompted:

```powershell
$AdminSecretKey = [Net.NetworkCredential]::new('', (Read-Host 'Admin key' -AsSecureString)).Password
$UserPassword = [Net.NetworkCredential]::new('', (Read-Host 'New user password' -AsSecureString)).Password
$Body = @{ username = 'admin'; password = $UserPassword; display_name = 'Admin' } | ConvertTo-Json -Compress
curl.exe --fail-with-body --request POST "http://localhost:8080/api/v1/auth/register" `
  --header "Content-Type: application/json" `
  --header "X-Admin-Key: $AdminSecretKey" `
  --data-raw $Body
if ($LASTEXITCODE -ne 0) { throw "User registration failed" }
Remove-Variable AdminSecretKey, UserPassword, Body
```

This calls the protected registration endpoint through nginx; it does not expose backend port 8000 or run `seed.py`.

### Backup and restore

Create a consistent, timestamped SQLite backup using SQLite's online backup API:

```powershell
.\scripts\backup.ps1
```

```bash
./scripts/backup.sh
```

The scripts keep the latest 7 backups by default. To change retention for one run, set `FINKU_BACKUP_KEEP` in the shell before running the script. Follow [scripts/restore.md](scripts/restore.md) to restore; it requires stopping the backend before replacing the database.

### Update

From the repository root:
```bash
git pull && docker compose up -d --build
```

In PowerShell, run `git pull` and then `docker compose up -d --build` on separate lines.

> **Warning:** `docker compose down -v` deletes the `finku-data` volume and all financial data. Use `docker compose down` (without `-v`) for a normal stop.

### Remote access

Installing the PWA on a phone requires HTTPS; plain HTTP is suitable only for local development and local-network testing. For private home-server access, [Tailscale Serve](https://tailscale.com/docs/features/tailscale-serve) can proxy the published frontend port and provide a tailnet HTTPS URL:

```bash
tailscale serve 8080
```

This is documentation only; configure Tailscale and HTTPS on your own server. Do not expose backend port 8000.

## Development Quick Start

### Backend
```bash
cd backend
uv sync
cp .env.example .env
# Set ENVIRONMENT=development, DATABASE_URL=sqlite:///./finku.db, and
# ALLOWED_ORIGINS=["http://localhost:5173"] in .env.
# Use local-only values for the required secrets before running seed.py.
alembic upgrade head
python seed.py
fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
cd backend
uv run pytest tests/ -v

cd ../frontend
npm test
```

## Roadmap
- [x] Project scaffolding & monorepo setup
- [x] Database schema & Alembic migrations (SQLite batch-mode compliant)
- [x] REST API (accounts, transactions, balances, analytics, auth)
- [x] PDF statement import (BCA)
- [x] Multi-currency transactions & exchange rate integration (IDR / USD)
- [x] Idempotency & money-integrity safeguards (insufficient funds rejection)
- [x] Rate limiting (slowapi)
- [x] Dashboard UI (accounts grid, metric summaries, recent activity)
- [x] Import page UI with automatic categorization and post-import results
- [x] Transactions UI (search, filters, date grouping, pagination, edit & delete)
- [x] Analytics UI (net worth trend, cashflow, category breakdown)
- [x] Settings UI (profile management, password changes, account CRUD dialogs; theme control is in the shared app header)
- [x] Dark mode with instant theme switching & persistence
- [x] Dashboard amount visibility with global controls that override section-specific settings
- [x] PWA service worker (production-verified shell-only precache and user-confirmed updates)
- [x] Docker Compose / home server deployment package
- [ ] PWA offline UX (install banner, offline state, and network/auth error handling)
- [ ] Additional PDF parsers (Mandiri, Seabank, Bank Jago)
- [ ] CSV import support

PWA status: installable shell, offline UX pending. Chrome DevTools installability diagnostics still need manual confirmation.
