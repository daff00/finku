# database-health Specification

## Purpose
Defines the database connectivity behavior exposed by the service health endpoint.

## Requirements

### Requirement: Verify database connectivity
The system SHALL execute a database query before reporting the database as connected from `GET /health`.

#### Scenario: Database is available
- **WHEN** `GET /health` can execute a trivial database query
- **THEN** it returns HTTP 200 with `status` set to `healthy` and `database` set to `connected`.

#### Scenario: Database is unavailable
- **WHEN** the database query fails
- **THEN** `GET /health` returns HTTP 503 with `status` set to `unhealthy` and `database` set to `disconnected`.
