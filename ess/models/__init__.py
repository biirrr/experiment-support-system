"""Database models."""
import logging

from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

from .meta import metadata, Base  # noqa
from ..settings import settings

logger = logging.getLogger(__name__)
_engine = None


def get_engine() -> AsyncEngine:
    """Get the database engine.

    This returns a singleton instance.

    :return: The database engine as configured by the settings.
    :rtype: :class:`~sqlalchemy.ext.asyncio.AsyncEngine`
    """
    global _engine
    if _engine is None:
        logger.debug('Creating engine')
        _engine = create_async_engine(settings.db.sqla_dsn)
    return _engine
