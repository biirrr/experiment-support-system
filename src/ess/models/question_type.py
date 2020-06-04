from copy import deepcopy
from sqlalchemy import (Column, Integer, Boolean, Unicode, UnicodeText, ForeignKey)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class QuestionType(Base):

    __tablename__ = 'question_types'

    id = Column(Integer, primary_key=True)
    question_type_group_id = Column(Integer, ForeignKey('question_type_groups.id'))
    parent_id = Column(Integer, ForeignKey('question_types.id'))
    name = Column(Unicode(255))
    enabled = Column(Boolean(create_constraint=False))
    position = Column(Integer)
    source = Column(UnicodeText)
    attributes = Column(NestedMutableJson)

    question_type_group = relationship('QuestionTypeGroup')
    parent = relationship('QuestionType', remote_side=[id])
    children = relationship('QuestionType', cascade="all, delete-orphan")

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

    def inherited_attributes(self):
        if self.parent:
            attributes = dict([(key, value) for key, value in self.parent.inherited_attributes().items()
                               if not key.startswith('_') or key == '_core_type'])
            attributes.update(self.attributes)
            if self.name.startswith('USEF'):
                attributes['_core_type'] = self.name
            attributes['_name'] = self.name
            attributes['_enabled'] = self.enabled
            attributes['_position'] = self.position
            return attributes
        else:
            attributes = deepcopy(self.attributes)
            attributes['_name'] = self.name
            attributes['_enabled'] = self.enabled
            attributes['_position'] = self.position
            return attributes

    def as_jsonapi(self):
        data = {
            'type': 'question-types',
            'id': str(self.id),
            'attributes': self.inherited_attributes(),
            'relationships': {
                'question-type-group': {
                    'data': {
                        'type': 'question-type-groups',
                        'id': str(self.question_type_group_id),
                    }
                },
            }
        }
        if self.parent:
            data['relationships']['parent'] = {
                'data': {
                    'type': 'question-types',
                    'id': str(self.parent_id)
                }
            }
        return data
