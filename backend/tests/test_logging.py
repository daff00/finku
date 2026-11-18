import sys

from app.core import logging as app_logging
from app.core.config import settings


def test_production_logging_defaults_to_console_only(monkeypatch):
    added_sinks = []
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "LOG_FILE", None)
    monkeypatch.setattr(app_logging.logger, "remove", lambda: None)
    monkeypatch.setattr(
        app_logging.logger,
        "add",
        lambda sink, **kwargs: added_sinks.append(sink),
    )

    app_logging.setup_logging()

    assert added_sinks == [sys.stderr]


def test_configured_log_file_parent_is_created(tmp_path, monkeypatch):
    log_file = tmp_path / "logs" / "finku.log"
    added_sinks = []
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    monkeypatch.setattr(settings, "LOG_FILE", str(log_file))
    monkeypatch.setattr(app_logging.logger, "remove", lambda: None)
    monkeypatch.setattr(
        app_logging.logger,
        "add",
        lambda sink, **kwargs: added_sinks.append(sink),
    )

    app_logging.setup_logging()

    assert log_file.parent.is_dir()
    assert added_sinks == [sys.stderr, str(log_file)]


def test_unwritable_log_directory_falls_back_to_console(monkeypatch, capsys):
    added_sinks = []
    warnings = []
    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "LOG_FILE", None)
    monkeypatch.setattr(app_logging.logger, "remove", lambda: None)
    monkeypatch.setattr(
        app_logging.logger,
        "add",
        lambda sink, **kwargs: added_sinks.append(sink),
    )
    monkeypatch.setattr(
        app_logging.Path,
        "mkdir",
        lambda *args, **kwargs: (_ for _ in ()).throw(
            PermissionError("access denied")
        ),
    )
    monkeypatch.setattr(
        app_logging.logger,
        "warning",
        lambda message, *args: warnings.append(message.format(*args)),
    )

    app_logging.setup_logging()

    assert added_sinks == [sys.stderr]
    assert warnings and "access denied" in warnings[0]
