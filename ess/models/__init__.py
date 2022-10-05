"""Database models."""
import logging

from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, AsyncSession
from sqlalchemy.orm import sessionmaker
from typing import Callable

from .meta import metadata, Base  # noqa: F401
from .user import User  # noqa: F401
from ..settings import settings

logger = logging.getLogger(__name__)
_engine = None
_session_factory = None


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


def get_sessionmaker() -> Callable[[], AsyncSession]:
    """Get the database session factory.

    :return: A database session factory.
    :rtype: `Callable[[], AsyncSession]`
    """
    global _session_factory
    if _session_factory is None:
        logger.debug('Creating sessionmaker')
        _session_factory = sessionmaker(get_engine(), class_=AsyncSession)
    return _session_factory


def get_session() -> AsyncSession:
    """Get a database session.

    :return: A database session
    :rtype: :class:`~sqlalchemy.ext.asyncio.AsyncSession`
    """
    return get_sessionmaker()()
