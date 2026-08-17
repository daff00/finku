# bank-statement-import Specification

## Purpose

This capability provides a single bank statement import contract that stays stable as the parser list grows. BCA is the first supported parser, but the API must remain the same when Mandiri, Jago, Seabank, or other parsers are added later.

## Requirements

### Requirement: Stable import contract
The system MUST accept bank statement import requests through one generic contract that includes the target account, the bank identifier, and the uploaded statement file.

#### Scenario: Importing a BCA statement
- **WHEN** a user submits a BCA PDF with a valid target account and bank identifier
- **THEN** the system accepts the request without requiring a BCA-specific API shape
- **AND** the system associates the imported transactions with that account

### Requirement: Parser selection is internal
The system MUST choose the parser server-side from the bank identifier and MUST NOT require clients to know which parser implementation is used.

#### Scenario: Future parser addition
- **WHEN** a new supported bank parser is added later
- **THEN** the client can continue using the same import request contract
- **AND** the backend can route the request to the new parser without changing the API shape

### Requirement: Import outcomes are normalized
The system MUST return a consistent import result that reports parsed rows, imported rows, duplicate rows, error count, and error details regardless of which parser handled the file.

#### Scenario: Unsupported file contents
- **WHEN** a user uploads a statement that the selected parser cannot read
- **THEN** the system returns a clear import failure
- **AND** the response does not expose parser-specific internals

### Requirement: Import respects user isolation
The system MUST only import into accounts owned by the authenticated user.

#### Scenario: Cross-user account access
- **WHEN** a user attempts to import into an account owned by another user
- **THEN** the system rejects the request
- **AND** no transactions are created
