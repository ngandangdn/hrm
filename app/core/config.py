"""Application configuration loaded from environment variables."""

from functools import lru_cache
from os import getenv


class Settings:
    """Small settings object for database and JWT configuration."""

    PROJECT_NAME: str = getenv("PROJECT_NAME", "HiCAS HRM")
    ENVIRONMENT: str = getenv("ENVIRONMENT", "dev")
    DB_URL: str = getenv(
        "DB_URL",
        "mysql+pymysql://root:password@localhost:3306/datn1",
    )
    JWT_SECRET: str = getenv("JWT_SECRET", "change-this-secret-in-env")
    JWT_ALGORITHM: str = getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(
        getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7")
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
