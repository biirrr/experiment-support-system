"""Database management CLI commands."""
from typer import Typer

app = Typer(help='Database management commands')


@app.command()
def upgrade(drop_existing: bool = False) -> None:
    """Upgrade the database to the latest version.py.

    Pass --drop-existing to remove any existing tables and data first.
    """
    pass
