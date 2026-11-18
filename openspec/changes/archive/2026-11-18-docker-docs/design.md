## Context

See proposal.md for the motivation. The deployment uses root-level Compose with a required project `.env` for interpolation and a separate `backend/.env` for runtime configuration.

## Goals / Non-Goals

**Goals:**
- Keep the three project guides consistent about how to start, provision, back up, restore, update, and securely access the deployment.
- Explain the single-writer SQLite limit and HTTPS requirement without implementing a remote-access service.

**Non-Goals:**
- Add deployment automation, domain configuration, TLS termination, or a Tailscale dependency.
- Change runtime behavior or OpenSpec product requirements.

## Decisions

- Make README the operator-facing quick start and link its restore details to `scripts/restore.md`.
- Keep CLAUDE.md's current-status section concise, pointing to README for command-level steps.
- Add a focused deployment architecture section and correct the existing monorepo rationale instead of rewriting unrelated architectural decisions.
- Document `tailscale serve` as a recommended HTTPS remote-access path only; users configure it on their own home server.

## Risks / Trade-offs

- [Example hostnames or deployment origins may be copied unchanged] → Mark the reserved example hostname as a value to replace and describe the same-origin local default.
- [Operators may expose SQLite to multiple writers] → State clearly that the backend must remain a single instance.
- [Operators may destroy the named volume during cleanup] → Prominently warn that `docker compose down -v` deletes the database.
