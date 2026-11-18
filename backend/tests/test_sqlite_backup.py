import sqlite3
from contextlib import closing
from pathlib import Path

import pytest

from app.core.sqlite_backup import create_online_backup, restore_database


def test_create_online_backup_copies_database_while_source_is_open(tmp_path):
    source_path = tmp_path / "source.db"
    destination_path = tmp_path / "backups" / "snapshot.db"
    source_connection = sqlite3.connect(source_path)
    source_connection.execute("CREATE TABLE users (username TEXT NOT NULL)")
    source_connection.execute("INSERT INTO users (username) VALUES (?)", ("local-user",))
    source_connection.commit()
    try:
        create_online_backup(source_path, destination_path)
    finally:
        source_connection.close()

    with sqlite3.connect(destination_path) as backup_connection:
        assert backup_connection.execute("SELECT username FROM users").fetchone() == (
            "local-user",
        )


def test_create_online_backup_rejects_missing_source(tmp_path):
    with pytest.raises(FileNotFoundError, match="source database does not exist"):
        create_online_backup(tmp_path / "missing.db", tmp_path / "backup.db")


def test_create_online_backup_does_not_overwrite_existing_destination(tmp_path):
    source_path = tmp_path / "source.db"
    destination_path = tmp_path / "backup.db"
    source_path.touch()
    destination_path.write_bytes(b"existing")

    with pytest.raises(FileExistsError, match="already exists"):
        create_online_backup(source_path, destination_path)

    assert destination_path.read_bytes() == b"existing"


def test_restore_database_atomically_replaces_data_and_clears_sidecars(tmp_path):
    source_path = tmp_path / "backup.db"
    destination_path = tmp_path / "finku.db"
    with closing(sqlite3.connect(source_path)) as source_connection:
        source_connection.execute("CREATE TABLE users (username TEXT NOT NULL)")
        source_connection.execute("INSERT INTO users (username) VALUES (?)", ("restored",))
        source_connection.commit()
    with closing(sqlite3.connect(destination_path)) as destination_connection:
        destination_connection.execute("CREATE TABLE users (username TEXT NOT NULL)")
        destination_connection.execute("INSERT INTO users (username) VALUES (?)", ("old",))
        destination_connection.commit()
    Path(f"{destination_path}-wal").touch()
    Path(f"{destination_path}-shm").touch()

    restore_database(source_path, destination_path)

    with closing(sqlite3.connect(destination_path)) as restored_connection:
        assert restored_connection.execute("SELECT username FROM users").fetchone() == (
            "restored",
        )
    assert not Path(f"{destination_path}-wal").exists()
    assert not Path(f"{destination_path}-shm").exists()


def test_restore_database_preserves_destination_when_backup_is_invalid(tmp_path):
    source_path = tmp_path / "invalid.db"
    destination_path = tmp_path / "finku.db"
    source_path.write_bytes(b"not a database")
    with closing(sqlite3.connect(destination_path)) as destination_connection:
        destination_connection.execute("CREATE TABLE users (username TEXT NOT NULL)")
        destination_connection.execute("INSERT INTO users (username) VALUES (?)", ("keep",))
        destination_connection.commit()

    with pytest.raises(sqlite3.DatabaseError):
        restore_database(source_path, destination_path)

    with closing(sqlite3.connect(destination_path)) as destination_connection:
        assert destination_connection.execute("SELECT username FROM users").fetchone() == (
            "keep",
        )
