from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Finku - Backend"
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
    ADMIN_SECRET_KEY: str
    
    model_config = SettingsConfigDict(env_file='.env')

settings = Settings()