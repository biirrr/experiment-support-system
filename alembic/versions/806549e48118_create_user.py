"""Create user.

Revision ID: 806549e48118
Revises:
Create Date: 2022-10-05 21:41:01.398016

"""
from alembic import op
from sqlalchemy import Column, String
from sqlalchemy_json import NestedMutableJson

# revision identifiers, used by Alembic.
revision = '806549e48118'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the user table."""
    op.create_table('users',
                    Column('id', String(255), primary_key=True),
                    Column('attributes', NestedMutableJson()))


def downgrade() -> None:
    """Drop the user ^table."""
    op.drop_table('users')
