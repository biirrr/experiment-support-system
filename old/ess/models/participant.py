from copy import deepcopy
from sqlalchemy import (Column, Integer, ForeignKey, Index, Unicode, Boolean)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Participant(Base):

    __tablename__ = 'participants'

    id = Column(Integer, primary_key=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id'))
    external_id = Column(Unicode(191))
    attributes = Column(NestedMutableJson)
    responses = Column(NestedMutableJson)
    completed = Column(Boolean(name='is_boolean'))

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
        attributes = deepcopy(self.attributes)
        attributes['responses'] = self.responses
        return {
            'type': 'participants',
            'id': str(self.external_id),
            'attributes': attributes,
            'relationships': {
                'experiment': {
                    'data': {
                        'type': 'experiments',
                        'id': str(self.experiment.external_id),
                    }
                },
            }
        }


Index('participants_external_id_ix', Participant.external_id, unique=True, mysql_length=191)
