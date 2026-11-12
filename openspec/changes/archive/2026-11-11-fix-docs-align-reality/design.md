## Context

The current docs claim 89 passing tests, an import preview/confirmation flow, and separate `/import/pdf` and `/import/csv` endpoints. The verified backend suite now has 94 passing tests, the frontend imports directly and displays post-import results, and the API exposes a unified `/import/` endpoint. Account creation now atomically persists its epoch baseline, and transfer fee transactions cannot be deleted independently.

## Decision

Update the listed documentation and the root README wherever the same stale import claim appears. Use the actual seed credentials (`admin / admin`) and current test count. Keep the root `architecture.md` spelling used by the repository. No behavior or capability specs change.
