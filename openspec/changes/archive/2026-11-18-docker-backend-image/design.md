## Context

See proposal.md for the motivation. The backend already declares `fastapi[standard]`, which supplies Uvicorn at runtime. Online Alembic migrations use `settings.DATABASE_URL`; the Compose migration service can therefore mount the same `/data` location as the API.

## Goals / Non-Goals

**Goals:**
- Keep the runtime image lean, non-root, and separate from the SQLite volume.
- Preserve local development logging while making production logging compatible with container output.

**Non-Goals:**
- Running migrations in the API startup command or including frontend/static hosting in this image.

## Decisions

- Use Python 3.12 slim build and runtime stages. Install uv in the build stage, sync the locked production environment into `.venv`, and copy only that environment and application/migration sources to the runtime image.
- Create a dedicated non-root runtime identity and writable `/data` directory. Do not copy the repository database or seed scripts.
- Keep stdout logging always enabled; add the existing rotating file sink only outside production or when `LOG_FILE` is explicitly set. This avoids file permission failures in production.
- Use Python's standard-library `urllib.request` in the image healthcheck, avoiding a curl runtime dependency.
- Keep Uvicorn transitive through the existing `fastapi[standard]` extra; verify the installed runtime rather than adding a redundant dependency.

## Risks / Trade-offs

- [The Docker engine is unavailable in the current environment] → Validate source-level assumptions and mark image/runtime checks manual; do not claim Docker build success.
