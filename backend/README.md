# Finku — Backend

> REST API for Finku personal finance tracker, built with FastAPI + SQLAlchemy + SQLite.

## Tech Stack
- **Python** 3.12
- **FastAPI** 0.141.x
- **SQLAlchemy** 2.0.x
- **Alembic** — database migrations
- **SQLite** — local database (PostgreSQL-ready)
- **uv** — package manager

## Project Structure
```
backend/
├── app/
│ ├── api/
│ │ └── routes/ # API route handlers
│ ├── core/
│ │ ├── config.py # Environment settings
│ │ └── database.py # SQLAlchemy engine + session
│ ├── models/
│ │ └── models.py # Database table definitions
│ ├── parsers/ # CSV + PDF import parsers
│ ├── schemas/
│ │ └── schemas.py # Pydantic request/response models
│ └── services/ # Business logic
├── migrations/ # Alembic migration files
├── .env.example # Environment variable template
├── pyproject.toml # Dependencies
└── main.py # App entry point
```

## Setup

```bash
# 1. Create virtual environment
uv venv --python 3.12
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
uv sync

# 3. Set up environment variables
cp .env.example .env
# Edit .env and set your SECRET_KEY

# 4. Run database migrations
alembic upgrade head

# 5. Start development server
fastapi dev app/main.py
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Accounts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/accounts` | List all accounts |
| POST | `/accounts` | Create account |
| GET | `/accounts/{id}` | Get account detail |
| PATCH | `/accounts/{id}` | Update account |
| DELETE | `/accounts/{id}` | Soft delete account |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions` | List transactions (filterable) |
| POST | `/transactions` | Create transaction |
| GET | `/transactions/{id}` | Get transaction detail |
| PATCH | `/transactions/{id}` | Update transaction |
| DELETE | `/transactions/{id}` | Delete transaction |
| POST | `/transactions/transfer` | Internal transfer |

### Balances
| Method | Endpoint | Description |
|---|---|---|
| GET | `/balances` | List balance snapshots |
| POST | `/balances` | Create balance snapshot |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/networth` | Net worth across all accounts |
| GET | `/analytics/monthly` | Monthly income vs expenses |
| GET | `/analytics/categories` | Spending by category |

### Import
| Method | Endpoint | Description |
|---|---|---|
| POST | `/import/csv` | Import CSV bank statement |
| POST | `/import/pdf` | Import PDF statement (BCA) |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./finku.db` |
| `SECRET_KEY` | JWT signing key | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `10080` (7 days) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |