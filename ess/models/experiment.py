"""Models for the user."""
from pydantic import BaseModel, constr
from sqlalchemy import Column, Integer, Unicode, ForeignKey

from .meta import Base


class Experiment(Base):
    """The Experiment database model."""

    __tablename__ = 'experiments'

    id = Column(Integer(), primary_key=True)
    owner_id = Column(Integer, ForeignKey('users.id'))
    title = Column(Unicode(255))
    status = Column(Unicode(16))


class ExperimentModel(BaseModel):
    """The Pydantic model for formatting an experiment."""

    id: int
    owner_id: int
    title: str
    status: str

    class Config:
        """Configuration to set orm_mode to True."""

        orm_mode = True


class CreateExperimentModel(BaseModel):
    """The Pydantic model to validate creating a new experiment."""

    title: constr(strip_whitespace=True, min_length=1)
