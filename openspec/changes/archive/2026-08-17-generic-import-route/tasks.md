## 1. Import Contract

- [x] 1.1 Replace the import stub with one stable upload endpoint that accepts `account_id`, `bank`, and the statement file.
- [x] 1.2 Return a normalized import result shape with parsed, imported, duplicate, and error counts plus error details.
- [x] 1.3 Reject unsupported bank/file combinations with a clear client-facing error.

## 2. Parser Dispatch and Validation

- [x] 2.1 Add a backend parser registry or dispatch layer that selects the parser from the bank identifier.
- [x] 2.2 Wire the existing BCA parser through the generic import path without exposing BCA-specific API shape.
- [x] 2.3 Enforce authenticated user ownership of the target account before parsing or saving transactions.

## 3. Tests and Client Surface

- [x] 3.1 Add backend tests for a successful BCA import through the generic route.
- [x] 3.2 Add backend tests for cross-user account rejection and unsupported import inputs.
- [x] 3.3 Update the frontend import service and import page to call the stable import contract.
