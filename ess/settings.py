"""Application settings.

Access the application settings by importing the ``settings`` object from here.
"""
from pydantic import BaseModel, BaseSettings


class DatabaseSettings(BaseModel):
    """Configures the database access."""

    sqla_dsn: str
    """The SQLAlchemy DSN for accessing the database."""


class Settings(BaseSettings):
    """Configures the application."""

    db: DatabaseSettings
    """The database settings to use."""

    class Config:
        """Settings configuration."""

        env_file = '.env'
        env_file_encoding = 'utf-8'
        env_nested_delimiter = '.'


settings = Settings()
