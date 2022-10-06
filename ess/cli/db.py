"""Database management CLI commands."""
import logging

from asyncio import run as asyncio_run
from importlib import resources
from sqlalchemy.ext.asyncio import AsyncEngine
from typer import Typer

from ..models import get_engine
from ..settings import settings

logger = logging.getLogger(__name__)

app = Typer(help='Database management commands')


@app.command()
def upgrade(drop_existing: bool = False, drop_last: bool = False) -> None:
    """Upgrade the database to the latest version.py.

    Pass --drop-existing to remove any existing tables and data first.
    Pass --drop-last to undo only the last revision.
    """
    from alembic.config import Config
    from alembic import command

    alembic_config = Config()
    alembic_config.set_main_option('script_location', str(resources.path('ess', 'alembic')))
    alembic_config.set_main_option('sqlalchemy.url', settings.db.sqla_dsn)

    async def run() -> None:
        """Run the actual upgrade process."""
        def sync_db_ops(conn: AsyncEngine) -> None:
            """Run the alembic commands synchronously."""
            try:
                alembic_config.attributes['connection'] = conn
                if drop_existing:
                    logger.debug('Removing existing tables')
                    command.downgrade(alembic_config, 'base')
                elif drop_last:
                    logger.debug('Downgrading the latest revision')
                    command.downgrade(alembic_config, '-1')
                logger.debug('Running upgrade')
                command.upgrade(alembic_config, 'head')
            except Exception as e:
                logger.error(e)

        async with get_engine().begin() as conn:
            await conn.run_sync(sync_db_ops)

    asyncio_run(run())
