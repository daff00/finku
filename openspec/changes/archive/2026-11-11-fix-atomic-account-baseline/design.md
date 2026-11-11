## Context

`create_account` currently commits the account, refreshes it, then inserts and commits a zero balance snapshot. The intermediate commit permits a partially created account.

## Decision

Keep the account and snapshot in one SQLAlchemy transaction. Flush the account to allocate its primary key, add the snapshot with the authenticated user's ID and `Decimal("0")`, then commit once. The existing UTC Unix-epoch timestamp remains the baseline timestamp.

Add a successful-creation assertion for both database records and a failure-path test that forces the baseline insert to fail, rolls back the request session, and verifies the account was not committed.

## Risks

An exception during the single commit must leave the session transaction rolled back by request teardown; the failure-path test checks persistence using a fresh transaction.
