## Purpose

Enforces strict local privacy by restricting user registration to administrators using a secure admin key, eliminating public self-registration.

## Requirements

### Requirement: Admin-Only User Registration
The system SHALL restrict user registration via `POST /api/v1/auth/register` exclusively to requests providing a valid administrative key in the `X-Admin-Key` header matching `ADMIN_SECRET_KEY`.

#### Scenario: Registration with valid admin key
- **WHEN** a client provides a valid `X-Admin-Key` header matching `ADMIN_SECRET_KEY` with unique user credentials
- **THEN** the system creates the user and returns HTTP 201 Created with the user record.

#### Scenario: Registration with missing or invalid admin key
- **WHEN** a client submits a registration request without `X-Admin-Key` or with an invalid key
- **THEN** the system rejects the request with HTTP 403 Forbidden.

### Requirement: Removal of Public Registration Interface
The user interface SHALL NOT expose public self-registration forms or links, preserving the invite-only access model.

#### Scenario: Public register route access
- **WHEN** a client attempts to navigate to a public `/register` route
- **THEN** the client is routed to the not-found or login flow rather than a public self-service signup form.

