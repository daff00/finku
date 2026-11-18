## 1. Backend container implementation

- [x] 1.1 Add a multi-stage Python 3.12 image using uv and only production runtime files/dependencies.
- [x] 1.2 Add build-context exclusions for secrets, databases, logs, virtual environments, node modules, and Git metadata.
- [x] 1.3 Configure non-root `/data` ownership, Uvicorn startup, and a standard-library healthcheck.
- [x] 1.4 Make backend log file output configurable and default to stdout-only in production.
- [x] 1.5 Verify runtime Uvicorn and confirm online Alembic migrations use `settings.DATABASE_URL`.

## 2. Verification

- [x] 2.1 Build the backend image and verify mounted-data startup and `/health` when Docker is available; otherwise record the exact manual check needed.
- [x] 2.2 Run the full backend suite and frontend build/tests.
