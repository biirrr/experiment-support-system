from sqlalchemy import (Column, Unicode, UnicodeText)
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Setting(Base):

    __tablename__ = 'settings'

    key = Column(Unicode(191), primary_key=True)
    value = Column(Unicode(255))
    values = Column(NestedMutableJson)
    guidance = UnicodeText()

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        return user and user.has_permission('admin.settings')
