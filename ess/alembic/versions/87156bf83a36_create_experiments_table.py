"""Create the experiments table.

Revision ID: 87156bf83a36
Revises: 7db5e61bae6b
Create Date: 2022-10-06 14:47:57.868430

"""
from alembic import op
from sqlalchemy import Column, Integer, Unicode, ForeignKey

from ess.models.meta import metadata


# revision identifiers, used by Alembic.
revision = '87156bf83a36'
down_revision = '7db5e61bae6b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade the database, creating the experiments table."""
    op.create_table('experiments',
                    metadata,
                    Column('id', Integer, primary_key=True),
                    Column('owner_id', Integer, ForeignKey('users.id')),
                    Column('title', Unicode(255)),
                    Column('status', Unicode(16)))


def downgrade() -> None:
    """Downgrade the database, dropping the experiments table."""
    op.drop_table('experiments')
