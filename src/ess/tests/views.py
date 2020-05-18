from hashlib import sha512
from pyramid.view import view_config
from secrets import token_hex

from ess.models import User, Experiment, ExperimentPermission, Page, Transition
from ess.models.meta import Base


def init_db(request):
    Base.metadata.drop_all(request.dbsession.bind)
    Base.metadata.create_all(request.dbsession.bind)


def create_user_1(request):
    user = request.dbsession.query(User).filter(User.email == 'test1@example.com').first()
    if not user:
        user = User(email='test1@example.com')
    user.salt = token_hex(32)
    hash = sha512()
    hash.update(user.salt.encode('utf-8'))
    hash.update(b'$$test1')
    user.password = hash.hexdigest()
    user.status = 'active'
    user.permissions = []
    user.groups = ['admin', 'creator']
    user.attributes = {'name': 'Test 1'}
    request.dbsession.add(user)
    return user


def create_experiment_1(request):
    user = create_user_1(request)
    experiment = Experiment(attributes={'title': 'Test 1', 'description': 'The first test experiment'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    return experiment


def create_experiment_2(request):
    user = create_user_1(request)
    experiment = Experiment(attributes={'title': 'Test 2', 'description': 'The second test experiment'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    page1 = Page(experiment=experiment, attributes={'name': 'welcome', 'title': 'Welcome'})
    request.dbsession.add(page1)
    page2 = Page(experiment=experiment, attributes={'name': 'consent', 'title': 'Informed Consent'})
    request.dbsession.add(page2)
    request.dbsession.add(Transition(source=page1, target=page2, attributes={}))
    return experiment


def create(request):
    """Handles the setup of test 1"""
    init_db(request)
    if 'obj' in request.params:
        for obj in request.params.getall('obj'):
            if obj == 'user1':
                create_user_1(request)
            elif obj == 'experiment1':
                create_experiment_1(request)
            elif obj == 'experiment2':
                create_experiment_2(request)
    return {}
