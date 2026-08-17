# accounts-rate-limiting Specification

## Purpose
This capability protects the accounts API from excessive request volume while preserving normal authenticated usage. It is the first step in a backend-wide rate limiting rollout that will later extend to other endpoint groups.

## Requirements

### Requirement: Accounts endpoints are rate limited
The system MUST rate limit authenticated requests to the accounts API so a user who exceeds the configured request rate receives a 429 response.

#### Scenario: Normal accounts usage
- **WHEN** an authenticated user makes requests within the configured accounts limit
- **THEN** the system processes the requests normally

#### Scenario: Rate limit exceeded
- **WHEN** an authenticated user exceeds the configured accounts request rate
- **THEN** the system returns HTTP 429 Too Many Requests

### Requirement: Rate limits are scoped to the authenticated user
The system MUST apply accounts rate limits per authenticated user rather than per shared application process.

#### Scenario: Two users hit the same endpoint
- **WHEN** two authenticated users independently call the same accounts endpoint
- **THEN** each user is limited by their own request history

### Requirement: Rate limit responses are explicit
The system MUST return a clear client-facing rate limit response when a request is blocked.

#### Scenario: Client retries after throttling
- **WHEN** a client receives a rate limit response from an accounts endpoint
- **THEN** the response clearly indicates that the request was throttled
- **AND** the client can tell that retrying later may succeed
