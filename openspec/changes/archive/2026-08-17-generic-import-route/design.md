## Context

See `proposal.md` for the motivation. The current backend has a placeholder import route, a working BCA parser, and a shared parser base that already knows how to persist parsed transactions and report duplicates.

## Goals / Non-Goals

**Goals:**
- Provide one stable backend import contract for bank statement uploads.
- Keep parser selection behind the backend so future parsers do not change the API shape.
- Reuse the existing parser result model and persistence flow.
- Preserve user/account isolation and existing money handling rules.

**Non-Goals:**
- Adding Mandiri, Jago, or Seabank parsers now.
- Building the import preview UI in this change.
- Adding rate limiting in this change.
- Redesigning transaction or account storage.

## Decisions

- Use a single import endpoint contract instead of bank-specific endpoints.
  - This keeps the client stable while parser support grows.
  - Alternative considered: separate `/import/pdf` and `/import/csv` routes. Rejected because it hard-codes file format concerns into the API and makes future parser additions more awkward.

- Dispatch parsers behind a bank-aware registry.
  - The route should accept the bank identifier and target account, then resolve the correct parser internally.
  - Alternative considered: have the frontend choose a parser-specific endpoint. Rejected because it couples the UI to backend implementation details and breaks the “no API shape change” goal.

- Keep the parser contract narrow: file bytes in, parsed transactions out.
  - The route owns auth, account ownership checks, and persistence.
  - The parser only needs to understand statement structure, which makes future parser additions isolated and testable.

- Return a normalized import result instead of parser-specific payloads.
  - A shared result shape makes the frontend and tests independent from the parser implementation.
  - Alternative considered: return raw parser output and let callers interpret it. Rejected because it would leak parser differences and make future compatibility harder.

## Risks / Trade-offs

- A fixed bank identifier still needs new enum values as new banks are added → Mitigation: extend the allowed bank values without changing the request contract.
- A single route may feel less explicit than bank-specific endpoints → Mitigation: keep the response and validation clear so unsupported combinations fail fast.
- Direct import without a separate preview step can be harder to review before saving → Mitigation: keep the result shape normalized so a preview flow can be layered on later without changing the core contract.
