"""Models for an experiment screen."""
from pydantic import BaseModel, constr
from sqlalchemy import Column, Integer, Unicode, UnicodeText, ForeignKey
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Screen(Base):
    """The Screen database model."""

    __tablename__ = 'screens'

    id = Column(Integer(), primary_key=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id'))
    name = Column(Unicode(255))
    code = Column(UnicodeText)
    compiled = Column(NestedMutableJson)


class ScreenModel(BaseModel):
    """The Pydantic model for formatting a screen."""

    id: int
    experiment_id: int
    name: str
    code: str

    class Config:
        """Configuration to set orm_mode to True."""

        orm_mode = True


class CreateScreenModel(BaseModel):
    """The Pydantic model to validate creating a new screen."""

    name: constr(strip_whitespace=True, min_length=1)


class CompileScreenModel(BaseModel):
    """The Pydantic model to validate compiling a screen."""

    code: str


class UpdateScreenModel(BaseModel):
    """The Pydantic model to validate updating a screen."""

    name: constr(strip_whitespace=True, min_length=1)
    code: str
