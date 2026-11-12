## Context

`GET /health` currently returns a static connected status and cannot detect a failed database connection.

## Decision

Inject the standard `DbSession`, execute `text("SELECT 1")`, and return the healthy response only after success. Catch SQLAlchemy database errors and return the specified 503 JSON response. A database-specific exception is used rather than masking unrelated programming errors.

Exempt the endpoint from rate limiting so routine orchestrator probes are not throttled.

Add endpoint tests for a real successful query and an injected SQLAlchemy database failure.
