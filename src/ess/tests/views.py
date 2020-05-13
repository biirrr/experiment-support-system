from hashlib import sha512
from pyramid.view import view_config
from secrets import token_hex

from ess.models import User
from ess.models.meta import Base


def init_db(request):
    Base.metadata.drop_all(request.dbsession.bind)
    Base.metadata.create_all(request.dbsession.bind)


def create_user_1(request):
    user = User(email='test1@example.com')
    user.salt = token_hex(32)
    hash = sha512()
    hash.update(user.salt.encode('utf-8'))
    hash.update(b'$$test1')
    user.password = hash.hexdigest()
    user.status = 'active'
    request.dbsession.add(user)
    return user


def create(request):
    """Handles the setup of test 1"""
    init_db(request)
    if 'obj' in request.params:
        for obj in request.params.getall('obj'):
            if obj == 'user1':
                create_user_1(request)
    return {}
