from copy import deepcopy
from datetime import datetime
from sqlalchemy import (Column, Integer, DateTime, Unicode, ForeignKey, Index)
from sqlalchemy.orm import relationship
from sqlalchemy_json import NestedMutableJson

from .meta import Base


class Experiment(Base):

    __tablename__ = 'experiments'

    id = Column(Integer, primary_key=True)
    first_page_id = Column(Integer, ForeignKey('pages.id', use_alter=True))
    external_id = Column(Unicode(191))
    attributes = Column(NestedMutableJson)
    created = Column(DateTime, default=datetime.now)
    updated = Column(DateTime, default=None, onupdate=datetime.now)

    authorised_users = relationship('ExperimentPermission')
    first_page = relationship('Page', foreign_keys='Experiment.first_page_id', post_update=True)
    pages = relationship('Page', foreign_keys='Page.experiment_id', order_by='Page.id')
    participants = relationship('Participant')
    completed = relationship('Participant', primaryjoin='and_(Experiment.id == Participant.experiment_id,' +
                             'Participant.completed == True)')

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
                        if action in ['view', 'edit', 'participate']:
                            return True
                    elif permission.role == 'tester':
                        if action == 'participate':
                            return True
        else:
            if action == 'participate' and self.attributes['status'] == 'live':
                return True
        return False

    def as_jsonapi(self, external=False):
        attributes = deepcopy(self.attributes)
        attributes['_stats'] = {'participants': {'started': len(self.participants),
                                                 'completed': len(self.completed)}}
        data = {
            'type': 'experiments',
            'id': self.external_id if external else str(self.id),
            'attributes': attributes,
            'relationships': {
                'pages': {
                    'data': [{'type': 'pages', 'id': str(page.id)} for page in self.pages]
                },
                'permissions': {
                    'data': [{'type': 'experiment-permissions', 'id': str(perm.id)} for perm in self.authorised_users]
                },
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


Index('experiments_external_id_ix', Experiment.external_id, unique=True, mysql_length=191)
