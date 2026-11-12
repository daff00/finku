# seed-environment-guard Specification

## Purpose
TBD - created by archiving change fix-seed-production-guard. Update Purpose after archive.

## Requirements

### Requirement: Prevent production seed execution
The system SHALL prevent the seed function from creating development data when `ENVIRONMENT` is set to `production`.

#### Scenario: Seed invoked in production
- **WHEN** `seed()` is invoked with `ENVIRONMENT=production`
- **THEN** it prints an error and exits with status 1 before writing seed data.

#### Scenario: Seed invoked outside production
- **WHEN** the seed function is invoked with `ENVIRONMENT` unset or set to a non-production value
- **THEN** it warns that it creates development-only data and reports its default credentials.
