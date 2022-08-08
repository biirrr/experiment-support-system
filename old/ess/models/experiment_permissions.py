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

    def as_jsonapi(self, external=False):
        return {
            'type': 'experiment-permissions',
            'id': str(self.id),
            'attributes': {
                'role': self.role,
            },
            'relationships': {
                'experiment': {
                    'data': {
                        'type': 'experiments',
                        'id': str(self.experiment_id),
                    },
                },
                'user': {
                    'data': {
                        'type': 'users',
                        'id': str(self.user_id),
                    },
                },
            },
        }
