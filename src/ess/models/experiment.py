from datetime import datetime
from sqlalchemy import (Column, Integer, DateTime, Unicode, ForeignKey, Index)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Experiment(Base):

    __tablename__ = 'experiments'

    id = Column(Integer, primary_key=True)
    first_page_id = Column(Integer, ForeignKey('pages.id'))
    external_id = Column(Unicode(191))
    attributes = Column(NestedMutableJson)
    created = Column(DateTime, default=datetime.now)
    updated = Column(DateTime, default=None, onupdate=datetime.now)

    authorised_users = relationship('ExperimentPermission')
    first_page = relationship('Page', foreign_keys='Experiment.first_page_id', post_update=True)
    pages = relationship('Page', foreign_keys='Page.experiment_id', order_by='Page.id')

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
        data = {
            'type': 'experiments',
            'id': str(self.id),
            'attributes': self.attributes,
            'relationships': {
                'pages': {
                    'data': [{'type': 'pages', 'id': str(page.id)} for page in self.pages]
                }
            }
        }
        if self.first_page:
            data['relationships']['first-page'] = {
                'data': {
                    'type': 'pages',
                    'id': str(self.first_page.id),
                }
            }
        return data


Index('experiment_external_id_ix', Experiment.external_id, unique=True, mysql_length=191)
