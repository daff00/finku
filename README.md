# 💰 Finku — Personal Finance Tracker

> A personal budget & net worth tracker that aggregates all your Indonesian bank accounts into one clean dashboard.

## Features
- 📊 Real-time net worth across all accounts
- 🏦 Bank support: BCA ✅ | Mandiri, Seabank, Bank Jago (coming soon)
- 📥 Import transactions via PDF (BCA currently supported)
- ✍️ Manual transaction entry
- 📈 Monthly analytics — income, expenses, category breakdown
- 📱 Responsive — works on desktop and mobile browser (PWA)

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind v4, shadcn/ui |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic |
| Database | SQLite (PostgreSQL-ready) |

## Project Structure
```
finku/
├── frontend/ # React PWA
└── backend/ # FastAPI REST API
```

## Quick Start

### Backend
```bash
cd backend
uv venv --python 3.12
source .venv/bin/activate
uv sync
cp .env.example .env
alembic upgrade head
fastapi dev app/main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Roadmap
- [x] Project scaffolding
- [x] Database schema + migrations
- [x] REST API (accounts, transactions, analytics)
- [x] PDF import (BCA)
- [x] Rate limiting
- [x] Dashboard UI (working)
- [x] Import page UI (working)
- [ ] Additional PDF parsers (Mandiri, Seabank, Bank Jago) — after PWA
- [ ] CSV import support — deferred
- [ ] Transactions & Analytics pages UI
- [ ] Mobile responsive + PWA
- [ ] Docker / home server deployment