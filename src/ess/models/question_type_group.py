from sqlalchemy import (Column, Integer, Unicode, Boolean, UnicodeText)
from sqlalchemy.ext.orderinglist import ordering_list
from sqlalchemy.orm import relationship

from .meta import Base


class QuestionTypeGroup(Base):

    __tablename__ = 'question_type_groups'

    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    position = Column(Integer)
    enabled = Column(Boolean(create_constraint=False))
    source = Column(UnicodeText)

    question_types = relationship('QuestionType', order_by='QuestionType.position',
                                  collection_class=ordering_list('position'))

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
            'type': 'question-type-groups',
            'id': str(self.id),
            'attributes': {
                'title': self.title,
                'enabled': self.enabled,
                'position': self.position,
            },
            'relationships': {
                'question-types': {
                    'data': [{'type': 'question-types', 'id': str(question_type.id)}
                             for question_type in self.question_types]
                },
            }
        }
