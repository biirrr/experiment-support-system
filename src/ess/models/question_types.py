from sqlalchemy import (Column, Integer, Unicode, Boolean, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class QuestionType(Base):

    __tablename__ = 'question_types'

    id = Column(Integer, primary_key=True)
    question_type_group_id = Column(Integer, ForeignKey('question_type_groups.id'))
    parent_id = Column(Integer, ForeignKey('question_types.id'))
    enabled = Column(Boolean(create_constraint=False))
    position = Column(Integer)
    attributes = Column(NestedMutableJson)

    question_type_group = relationship('QuestionTypeGroup')
    parent = relationship('QuestionType')

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
        data = {
            'type': 'question_types',
            'id': str(self.id),
            'attributes': self.attributes,
            'relationships': {
                'question-type-group': {
                    'data': {
                        'type': 'question_type_groups',
                        'id': str(self.question_type_group_id),
                    }
                },
            }
        }
        if self.parent:
            data['relationships']['parent'] = {
                'data': {
                    'type': 'question_types',
                    'id': str(self.parent_id)
                }
            }
        return data
