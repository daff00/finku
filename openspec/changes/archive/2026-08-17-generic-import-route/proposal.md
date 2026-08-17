## Why

The current import route is only a stub, and the parser layer is already starting to branch into multiple bank formats. We need a stable import API now so BCA can be wired end-to-end without baking BCA-specific assumptions into the route shape and forcing later parser work to rewrite the endpoint.

## What Changes

- Replace the placeholder import route with a real statement import flow that accepts uploaded files through a stable API.
- Keep parser selection behind the backend, so future bank parsers can be added without changing the request contract.
- Support BCA as the first working parser behind the generic import flow.
- Normalize import results into a consistent response shape for preview and/or commit workflows.
- Keep the parser layer extensible so new statement formats can plug into the same route.

## Capabilities

### New Capabilities
- `bank-statement-import`: Import a bank statement through one stable backend route, with parser selection handled internally and future parsers added without changing the API shape.

### Modified Capabilities
- None

## Impact

- Backend import route implementation in `backend/app/api/routes/imports.py`
- Parser dispatch / registry logic in `backend/app/parsers/`
- Parser interface expectations shared by BCA and future bank parsers
- Import-related backend tests
- Frontend import page and service layer once the route contract is finalized
