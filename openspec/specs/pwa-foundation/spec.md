# pwa-foundation Specification

## Purpose

Provides an installable frontend shell while ensuring browser storage never turns financial API data into stale, misleading balances or transactions.

## Requirements

### Requirement: Service worker precaches only the app shell
The frontend SHALL precache only the built app shell and fingerprinted static assets with JavaScript, CSS, HTML, SVG, PNG, ICO, or WOFF2 extensions. The service worker MUST NOT cache API responses or any financial data.

#### Scenario: Static application build is precached
- **WHEN** the service worker is installed
- **THEN** its precache contains only the app entry document and eligible built static assets

#### Scenario: API requests are not cached
- **WHEN** the frontend makes a request to an API route
- **THEN** the service worker does not store or serve that response from browser cache

### Requirement: Client-side routes load through the app shell
The frontend SHALL serve the app entry document as the navigation fallback for client-side routes, while excluding API paths from that fallback.

#### Scenario: Deep link navigation
- **WHEN** a user opens or refreshes a client-side route such as `/transactions`
- **THEN** the application shell loads and the route is handled by the frontend

#### Scenario: API navigation is excluded
- **WHEN** a navigation targets an `/api` path
- **THEN** the service worker does not substitute the app entry document

### Requirement: Install metadata is available in the web manifest
The frontend SHALL publish a web manifest identifying the app as Finku with the specified root scope, standalone display, orientation, description, colors, and icon references.

#### Scenario: Browser reads the Finku manifest
- **WHEN** a browser loads the web manifest
- **THEN** it receives the name `Finku`, short name `Finku`, description `Personal finance tracker`, start URL `/`, scope `/`, standalone display, and any orientation
- **AND** the background color is `#FAFAF8` and the theme color is `#C0392B`
- **AND** the manifest references 192x192, 512x512 any-purpose, and 512x512 maskable icons

### Requirement: PWA icons use the Finku mark and maskable safe area
The frontend SHALL serve 192x192, 512x512, and 180x180 PNG icons with a centered white `金` mark on `#C0392B`. The 512x512 maskable icon SHALL have a full-bleed red background and keep the mark within the centered 80% safe zone.

#### Scenario: Standard and Apple icons are available
- **WHEN** an install surface requests a configured PWA icon
- **THEN** the 192x192, 512x512, and 180x180 PNG assets load with the centered Finku mark

#### Scenario: Maskable icon survives launcher cropping
- **WHEN** a platform crops the maskable icon to its safe zone
- **THEN** the full-bleed background remains red and the complete `金` mark remains visible

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
