from collections import OrderedDict
from datetime import datetime
from pyramid.decorator import reify
from sqlalchemy import (Column, Index, Integer, Unicode, DateTime)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


PERMISSIONS = OrderedDict((('admin.view', 'Access the Admin Interface'),
                           ('admin.users', 'Administer Users'),
                           ('admin.experiments', 'Administer Experiments'),
                           ('admin.questionTypes', 'Administer Question Types'),
                           ('experiment.create', 'Create new Experiments')))
GROUPS = OrderedDict((('admin', ('admin.view', 'admin.users', 'admin.experiments', 'admin.question_types')),
                      ('creator', ('experiment.create',))))


class User(Base):

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(Unicode(191))
    salt = Column(Unicode(255))
    password = Column(Unicode(255))
    trust = Column(Unicode(255))
    status = Column(Unicode(255))
    groups = Column(NestedMutableJson)
    permissions = Column(NestedMutableJson)
    attributes = Column(NestedMutableJson)
    created = Column(DateTime, default=datetime.now)

    experiments = relationship('ExperimentPermission')

    def allow(self, user, action):
        """Check whether the given user is allowed to undertake the given action.

        :param user: The user to check for
        :type user: :class:`~toja.models.user.User`
        :param action: The action to check (view, edit, delete)
        :type action: ``str``
        """
        if action == 'view':
            return user is not None and (user.id == self.id or user.has_permission('admin.users'))
        elif action == 'edit':
            return user is not None and (user.id == self.id or user.has_permission('admin.users'))
        elif action == 'delete':
            return user is not None and (user.id == self.id or user.has_permission('admin.users'))
        else:
            return False

    def has_permission(self, permission, include_groups=True):
        if include_groups:
            return permission in self.full_permissions
        else:
            return permission in self.permissions

    @reify
    def full_permissions(self):
        return self.permissions + [perm for group, permissions in GROUPS.items()
                                   if group in self.groups for perm in permissions]


Index('users_email_ix', User.email, unique=True, mysql_length=191)
