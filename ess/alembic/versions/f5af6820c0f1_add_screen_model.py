"""Add the screen model.

Revision ID: f5af6820c0f1
Revises: 87156bf83a36
Create Date: 2022-10-14 21:26:26.940590
"""
from alembic import op
from sqlalchemy import Column, Integer, Unicode, ForeignKey

from ess.models.meta import metadata


# revision identifiers, used by Alembic.
revision = 'f5af6820c0f1'
down_revision = '87156bf83a36'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the screens table."""
    op.create_table('screens',
                    metadata,
                    Column('id', Integer, primary_key=True),
                    Column('experiment_id', Integer, ForeignKey('experiments.id')),
                    Column('name', Unicode(255)))


def downgrade() -> None:
    """Drop the screens table."""
    op.drop_table('screens')
