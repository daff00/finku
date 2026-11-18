## ADDED Requirements

### Requirement: First user is provisioned through the protected registration API
The deployment instructions SHALL create the first user through the existing admin-key-protected registration endpoint and SHALL NOT seed production data.

#### Scenario: Administrator provisions the first user
- **WHEN** an administrator submits registration through the nginx-published origin with the configured admin key
- **THEN** the application creates the user without exposing the backend port or running seed data

### Requirement: SQLite backups are consistent and retained
The deployment SHALL create backups through SQLite's online backup API while the backend may be writing and SHALL retain timestamped backup files, keeping seven by default.

#### Scenario: Backup runs while the application is active
- **WHEN** an operator starts a backup using the deployment scripts
- **THEN** a timestamped consistent database copy is saved outside the container and only the newest seven are kept unless configured otherwise

### Requirement: Restore replaces SQLite data only while the backend is stopped
The deployment instructions SHALL require stopping the backend before restoring a database file into its persistent volume and SHALL describe restarting and verifying the restored service.

#### Scenario: Operator restores a backup
- **WHEN** an operator selects a backup to restore
- **THEN** the backend is stopped before the database file is replaced, and the service is restarted and checked afterward
