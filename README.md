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

## Quick Start

### Backend
```bash
cd backend
uv sync
cp .env.example .env        # then fill in your secrets
alembic upgrade head
python seed.py              # development only
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
- [ ] PWA offline UX (install banner, offline state, and network/auth error handling)
- [ ] Additional PDF parsers (Mandiri, Seabank, Bank Jago)
- [ ] CSV import support
- [ ] Docker Compose / home server deployment package

PWA status: installable shell, offline UX pending. Chrome DevTools installability diagnostics still need manual confirmation.
