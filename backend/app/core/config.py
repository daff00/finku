from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_SECRET_NAMES = ("SECRET_KEY", "JWT_SECRET_KEY", "ADMIN_SECRET_KEY")
_PLACEHOLDER_SECRETS = {
    "changeme",
    "change-me",
    "change-me-to-a-long-random-string",
    "secret",
    "your-secret",
    "your-secret-key",
    "password",
    "example",
    "placeholder",
}


def _is_placeholder_secret(value: str) -> bool:
    normalized = value.strip().casefold()
    return (
        not normalized
        or normalized in _PLACEHOLDER_SECRETS
        or normalized.startswith(("your-secret", "changeme", "change-me"))
        or "..." in normalized
        or "…" in normalized
    )


class Settings(BaseSettings):
    app_name: str = "Finku - Backend"
    ENVIRONMENT: str = "development"
    LOG_FILE: str | None = None
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ACCOUNTS_RATE_LIMIT: str = "100/minute"
    API_RATE_LIMIT: str = "100/minute"
    TRANSACTIONS_RATE_LIMIT: str = "100/minute"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
    ADMIN_SECRET_KEY: str
    REGISTRATION_MODE: str = "admin_only"

    @model_validator(mode="after")
    def validate_production_secrets(self):
        if self.ENVIRONMENT.casefold() == "production":
            invalid_secrets = [
                name
                for name in _SECRET_NAMES
                if _is_placeholder_secret(getattr(self, name))
            ]
            if invalid_secrets:
                raise ValueError(
                    "Production secrets must be non-empty and non-placeholder: "
                    + ", ".join(invalid_secrets)
                )
        return self

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
