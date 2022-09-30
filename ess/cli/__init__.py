"""CLI base functionality."""
from typer import Typer

from .db import app as db_commands

app = Typer()
app.add_typer(db_commands, name='db')
