# 💰 Finku — Personal Finance Tracker

> A personal budget & net worth tracker that aggregates all your Indonesian bank accounts into one clean dashboard.

## Features
- 📊 Real-time net worth across all accounts
- 🏦 Supports BCA, Mandiri, Mandiri RDN, Seabank, Bank Jago, OVO, GoPay
- 📥 Import transactions via CSV or PDF
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
- [ ] CSV import (Mandiri, Seabank, Bank Jago)
- [ ] PDF import (BCA)
- [ ] Dashboard UI
- [ ] Analytics page
- [ ] Mobile responsive + PWA