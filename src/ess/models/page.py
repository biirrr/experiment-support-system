from datetime import datetime
from sqlalchemy import (Column, Index, Integer, Unicode, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Page(Base):

    __tablename__ = 'pages'

    id = Column(Integer, primary_key=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id'))
    name = Column(Unicode(255))
    title = Column(Unicode(255))
    attributes = Column(NestedMutableJson)

    experiment = relationship('Experiment')

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action. Delegates to the
        :class:`~ess.models.experiment.Experiment` :func:`~ess.models.experiment.Experiment.allow` method.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        return self.experiment.allow(user, action)

    def as_jsonapi(self):
        return {
            'type': 'pages',
            'id': str(self.id),
            'attributes': {
                'name': self.name,
                'title': self.title,
            },
            'relationships': {
                'experiment': {
                    'data': {
                        'type': 'experiments',
                        'id': str(self.experiment_id),
                    }
                }
            }
        }
