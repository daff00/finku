## Purpose

Provides an installable frontend shell while ensuring browser storage never turns financial API data into stale, misleading balances or transactions.

## ADDED Requirements

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
