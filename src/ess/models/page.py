from sqlalchemy import (Column, Integer, ForeignKey)
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Page(Base):

    __tablename__ = 'pages'

    id = Column(Integer, primary_key=True)
    experiment_id = Column(Integer, ForeignKey('experiments.id'))
    attributes = Column(NestedMutableJson)

    experiment = relationship('Experiment', foreign_keys='Page.experiment_id')
    next = relationship('Transition', foreign_keys='Transition.source_id')
    prev = relationship('Transition', foreign_keys='Transition.target_id')
    questions = relationship('Question', order_by='Question.position', collection_class=ordering_list('position'))

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action. Delegates to the
        :class:`~ess.models.experiment.Experiment` :func:`~ess.models.experiment.Experiment.allow` method.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        return self.experiment.allow(user, action)

    def as_jsonapi(self, external=False):
        return {
            'type': 'pages',
            'id': str(self.id),
            'attributes': self.attributes,
            'relationships': {
                'experiment': {
                    'data': {
                        'type': 'experiments',
                        'id': self.experiment.external_id if external else str(self.experiment_id),
                    }
                },
                'next': {
                    'data': [{'type': 'transitions', 'id': str(transition.id)} for transition in self.next]
                },
                'prev': {
                    'data': [{'type': 'transitions', 'id': str(transition.id)} for transition in self.prev]
                },
                'questions': {
                    'data': [{'type': 'questions', 'id': str(question.id)} for question in self.questions]
                }
            }
        }
