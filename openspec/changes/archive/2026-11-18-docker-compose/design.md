## Context

See proposal.md for the motivation. The backend image serves Uvicorn on port 8000, reads its SQLite URL from `DATABASE_URL`, and has a Docker healthcheck. The frontend image listens on nginx's unprivileged port 8080 and proxies to the Compose hostname `backend`.

## Goals / Non-Goals

**Goals:**
- Keep one SQLite-writing backend instance and serialize startup through an explicit migration job.
- Make Compose's interpolation-time secret checks agree with backend production validation.
- Preserve host-only exposure of the nginx port.

**Non-Goals:**
- Replicated backends, PostgreSQL, TLS termination, or automatic seeding.

## Decisions

- Use the default Compose network for frontend/backend/migrate and a named volume mounted at `/data` by migrate and backend. Publish only frontend port 8080, configurable by `FINKU_PORT`.
- Use `service_completed_successfully` for backend-to-migration ordering and `service_healthy` for frontend-to-backend ordering.
- Keep runtime application configuration in `backend/.env`; pass secrets through required Compose interpolation expressions, which override env-file values. A root `.env` or exported environment supplies interpolation values.
- Validate the three required secrets (`SECRET_KEY`, `JWT_SECRET_KEY`, `ADMIN_SECRET_KEY`) in production settings, rejecting empty strings and common example/placeholder values.
- Set nginx `X-Forwarded-For` to `$remote_addr` to avoid trusting a client-supplied forwarding chain. Uvicorn's proxy-header support is enabled and is limited to the private Compose path in operation.
- Keep `migrate` a non-restarting one-shot service and never include `seed.py` in any production command.

## Risks / Trade-offs

- [The CLI can be invoked with `--scale backend` despite the intended single instance] → Document SQLite's one-writer/single-backend constraint and avoid any multi-replica orchestration setting.
- [Compose interpolation uses the host environment or project `.env`, not the service env file] → Document both files and provide a clear PowerShell-friendly setup.
