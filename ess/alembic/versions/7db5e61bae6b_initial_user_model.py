"""Create the Initial User Model.

Revision ID: 7db5e61bae6b
Revises:
Create Date: 2022-09-30 22:50:08.200622
"""
from alembic import op
from sqlalchemy import Column, Unicode
from sqlalchemy_json import NestedMutableJson

from ess.models import metadata


# revision identifiers, used by Alembic.
revision = '7db5e61bae6b'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade the database, adding the users table."""
    op.create_table('users',
                    metadata,
                    Column('id', Unicode(255), primary_key=True),
                    Column('attributes', NestedMutableJson))


def downgrade() -> None:
    """Downgrade the database, removing the users table."""
    op.drop_table('users')
