from sqlalchemy import (Column, Integer, Unicode, Boolean)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class QuestionTypeGroup(Base):

    __tablename__ = 'question_type_groups'

    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    position = Column(Integer);
    enabled = Column(Boolean(create_constraint=False))

    question_types = relationship('QuestionType',
                                  primaryjoin='and_(QuestionTypeGroup.id == QuestionType.question_type_group_id,' +
                                  ' QuestionType.enabled == True)',
                                  order_by='QuestionType.position')

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action. The ``'view'`` ``action`` is always
        allowed while all other actions are denied.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        if action == 'view':
            return True
        else:
            return False

    def as_jsonapi(self):
        return {
            'type': 'question_type_groups',
            'id': str(self.id),
            'attributes': {
                'title': self.title,
            },
            'relationships': {
                'question-types': {
                    'data': [{'type': 'question_types', 'id': str(question_type.id)}
                             for question_type in self.question_types]
                },
            }
        }
