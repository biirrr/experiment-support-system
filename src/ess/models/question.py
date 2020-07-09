from sqlalchemy import (Column, Integer, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Question(Base):

    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    question_type_id = Column(Integer, ForeignKey('question_types.id'))
    page_id = Column(Integer, ForeignKey('pages.id'))
    position = Column(Integer)
    attributes = Column(NestedMutableJson)

    question_type = relationship('QuestionType')
    page = relationship('Page')

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action.  Delegates to the
        :class:`~ess.models.experiment.Experiment` :func:`~ess.models.experiment.Experiment.allow` method.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        return self.page.experiment.allow(user, action)

    def as_jsonapi(self):
        return {
            'type': 'questions',
            'id': str(self.id),
            'attributes': self.attributes,
            'relationships': {
                'question-type': {
                    'data': {'type': 'question-types',
                             'id': str(self.question_type.id)}
                },
                'page': {
                    'data': {'type': 'pages',
                             'id': str(self.page.id)}
                }
            }
        }
