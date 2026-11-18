import argparse
import os
import shutil
import sqlite3
import tempfile
from collections.abc import Sequence
from contextlib import closing
from pathlib import Path


def create_online_backup(source_path: str | Path, destination_path: str | Path) -> None:
    source = Path(source_path)
    destination = Path(destination_path)
    if not source.is_file():
        raise FileNotFoundError(f"SQLite source database does not exist: {source}")
    if source.resolve() == destination.resolve():
        raise ValueError("Backup destination must differ from the source database")
    if destination.exists():
        raise FileExistsError(f"Backup destination already exists: {destination}")

    destination.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(source)) as source_connection:
        with closing(sqlite3.connect(destination)) as destination_connection:
            source_connection.backup(destination_connection)


def restore_database(source_path: str | Path, destination_path: str | Path) -> None:
    source = Path(source_path)
    destination = Path(destination_path)
    if not source.is_file():
        raise FileNotFoundError(f"SQLite backup file does not exist: {source}")
    if source.resolve() == destination.resolve():
        raise ValueError("Restore source must differ from the destination database")

    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{destination.name}.restore-",
        dir=destination.parent,
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        shutil.copyfile(source, temporary)
        with closing(sqlite3.connect(temporary)) as restored_connection:
            integrity = restored_connection.execute("PRAGMA integrity_check").fetchone()
        if integrity != ("ok",):
            raise sqlite3.DatabaseError("SQLite backup failed integrity_check")

        Path(f"{destination}-wal").unlink(missing_ok=True)
        Path(f"{destination}-shm").unlink(missing_ok=True)
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def main(argv: Sequence[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Manage SQLite backups")
    parser.add_argument("--restore", action="store_true")
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--destination", required=True, type=Path)
    arguments = parser.parse_args(argv)
    if arguments.restore:
        restore_database(arguments.source, arguments.destination)
    else:
        create_online_backup(arguments.source, arguments.destination)


if __name__ == "__main__":
    main()
