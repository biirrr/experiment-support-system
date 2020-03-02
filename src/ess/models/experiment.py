from datetime import datetime
from sqlalchemy import (Column, Index, Integer, Unicode, UnicodeText, DateTime)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Experiment(Base):

    __tablename__ = 'experiments'

    id = Column(Integer, primary_key=True)
    title = Column(Unicode(255))
    description = Column(UnicodeText())
    status = Column(Unicode(255))
    attributes = Column(NestedMutableJson)
    created = Column(DateTime, default=datetime.now)
    updated = Column(DateTime, default=None, onupdate=datetime.now)

    authorised_users = relationship('ExperimentPermission')

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        if user is not None:
            for permission in self.authorised_users:
                if permission.user.id == user.id:
                    if permission.role == 'owner':
                        return True
                    elif permission.role == 'author':
                        if action in ['view', 'edit']:
                            return True
                    elif permission.role == 'tester':
                        if action == 'view':
                            return True
        return False

    def as_jsonapi(self):
        return {
            'type': 'experiments',
            'id': str(self.id),
            'attributes': {
                'title': self.title,
                'description': self.description,
                'status': self.status,
            }
        }
