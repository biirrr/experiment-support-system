"""Models for the user."""
from pydantic import BaseModel

from sqlalchemy import Column, String
from .meta import Base


class User(Base):
    """The User database model."""

    __tablename__ = 'users'

    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    email = Column(String(255))


class UserModel(BaseModel):
    """The User Pydantic model."""

    id: str
    name: str
    email: str

    class Config:
        """Configuration for the User Pydantic model."""

        orm_mode = True
