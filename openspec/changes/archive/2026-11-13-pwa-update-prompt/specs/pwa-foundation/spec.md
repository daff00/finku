## ADDED Requirements

### Requirement: Updates require explicit user confirmation
The frontend SHALL notify the user when a service-worker update is waiting and SHALL NOT apply or reload for that update until the user explicitly chooses to update.

#### Scenario: Waiting update is offered without blocking work
- **WHEN** a new service worker is waiting
- **THEN** the app shows a non-blocking notice that a new version is available with update and defer actions

#### Scenario: User applies the update
- **WHEN** the user chooses the update action
- **THEN** the waiting service worker activates and the page reloads to the updated app

#### Scenario: User defers the update
- **WHEN** the user chooses to defer
- **THEN** the notice is dismissed and the app does not apply or reload for the waiting update
