## ADDED Requirements

### Requirement: File logging failures do not prevent backend startup
The backend SHALL continue startup with console logging when its configured file log directory cannot be created or its file sink cannot be opened, and SHALL emit a warning identifying the logging fallback.

#### Scenario: Log directory is not writable
- **WHEN** the backend cannot create or open its configured file log
- **THEN** logging remains available through stdout/stderr, a warning is emitted, and application startup continues
