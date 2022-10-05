"""Models for the user."""
from sqlalchemy import Column, String
from sqlalchemy_json import NestedMutableJson
from .meta import Base


class User(Base):
    """The User database model."""

    __tablename__ = 'users'

    id = Column(String(255), primary_key=True)
    attributes = Column(NestedMutableJson)
