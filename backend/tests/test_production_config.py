import pytest
from pydantic import ValidationError

from app.core.config import Settings


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("SECRET_KEY", ""),
        ("SECRET_KEY", "changeme"),
        ("SECRET_KEY", "your-secret-key..."),
        ("JWT_SECRET_KEY", "change-me-to-a-long-random-string"),
        ("ADMIN_SECRET_KEY", "..."),
    ],
)
def test_production_settings_reject_empty_or_placeholder_secrets(field, value):
    settings_values = {
        "ENVIRONMENT": "production",
        "DATABASE_URL": "sqlite:////data/finku.db",
        "SECRET_KEY": "real-secret-value",
        "JWT_SECRET_KEY": "real-jwt-secret-value",
        "ADMIN_SECRET_KEY": "real-admin-secret-value",
    }
    settings_values[field] = value

    with pytest.raises(ValidationError, match="non-placeholder"):
        Settings(_env_file=None, **settings_values)


def test_production_settings_accept_configured_secrets():
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="production",
        DATABASE_URL="sqlite:////data/finku.db",
        SECRET_KEY="generated-secret-value",
        JWT_SECRET_KEY="generated-jwt-secret-value",
        ADMIN_SECRET_KEY="generated-admin-secret-value",
    )

    assert settings.ENVIRONMENT == "production"


def test_development_settings_allow_placeholders():
    settings = Settings(
        _env_file=None,
        ENVIRONMENT="development",
        DATABASE_URL="sqlite:///./finku.db",
        SECRET_KEY="changeme",
        JWT_SECRET_KEY="your-secret...",
        ADMIN_SECRET_KEY="",
    )

    assert settings.ENVIRONMENT == "development"
