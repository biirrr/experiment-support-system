from sqlalchemy import (Column, Integer, Unicode, ForeignKey)
from sqlalchemy.orm import relationship

from .meta import Base


class ExperimentPermission(Base):

    __tablename__ = 'experiment_permissions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    experiment_id = Column(Integer, ForeignKey('experiments.id'))
    role = Column(Unicode(255))

    experiment = relationship('Experiment')
    user = relationship('User')
