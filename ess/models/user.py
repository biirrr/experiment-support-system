"""Models for the user."""
from pydantic import BaseModel

from sqlalchemy import Column, Integer, Unicode
from .meta import Base


class User(Base):
    """The User database model."""

    __tablename__ = 'users'

    id = Column(Integer(), primary_key=True)
    external_id = Column(Unicode(255), unique=True)
    name = Column(Unicode(255))
    email = Column(Unicode(255))


class UserModel(BaseModel):
    """The User Pydantic model."""

    id: str
    name: str
    email: str

    class Config:
        """Configuration for the User Pydantic model."""

        orm_mode = True
