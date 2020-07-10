from sqlalchemy import (Column, Integer, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Transition(Base):

    __tablename__ = 'transitions'

    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey('pages.id'))
    target_id = Column(Integer, ForeignKey('pages.id'))
    attributes = Column(NestedMutableJson)

    source = relationship('Page', foreign_keys='Transition.source_id', post_update=True)
    target = relationship('Page', foreign_keys='Transition.target_id', post_update=True)

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action. Delegates to the
        :class:`~ess.models.experiment.Experiment` :func:`~ess.models.experiment.Experiment.allow` method.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        return self.source.experiment.allow(user, action)

    def as_jsonapi(self, external=False):
        data = {
            'type': 'transitions',
            'id': str(self.id),
            'attributes': self.attributes,
            'relationships': {
                'source': {
                    'data': {'type': 'pages', 'id': str(self.source.id)}
                },
                'target': {
                    'data': {'type': 'pages', 'id': str(self.target.id)}
                }
            }
        }
        return data
