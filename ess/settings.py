"""Application settings.

Access the application settings by importing the ``settings`` object from here.
"""
from pydantic import BaseModel, BaseSettings
from typing import Optional


class DatabaseSettings(BaseModel):
    """Configure the database access."""

    sqla_dsn: str
    """The SQLAlchemy DSN for accessing the database."""


class SecuritySettings(BaseModel):
    """Configure security settings."""

    oidc_config_endpoint: Optional[str]
    """The OIDC configuration endpoint."""


class Settings(BaseSettings):
    """Configures the application."""

    db: DatabaseSettings
    """The configured database settings"""
    security: Optional[SecuritySettings]
    """The configured security settings."""

    class Config:
        """Settings configuration."""

        env_file = '.env'
        env_file_encoding = 'utf-8'
        env_nested_delimiter = '.'


settings = Settings()
