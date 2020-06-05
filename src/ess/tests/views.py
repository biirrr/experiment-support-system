import json

from hashlib import sha512
from pkg_resources import resource_string
from secrets import token_hex

from ess.models import (User, Experiment, ExperimentPermission, Page, Transition, QuestionTypeGroup, QuestionType,
                        Question)
from ess.models.meta import Base
from ess.views.api.question_type import import_question_type


def init_db(request):
    Base.metadata.drop_all(request.dbsession.bind)
    Base.metadata.create_all(request.dbsession.bind)
    question_type_group = QuestionTypeGroup(title='Core Questions',
                                            position=0,
                                            enabled=True,
                                            source='https://biirrr.github.io/usef/questions/')
    request.dbsession.add(question_type_group)
    question_types = import_question_type(json.loads(resource_string('ess', 'scripts/questions.json')),
                                          request.dbsession,
                                          remap=False)
    question_type_group.question_types.extend(question_types)
    for idx, question_type in enumerate(question_types):
        question_type.enabled = True
        question_type.idx = idx
    request.dbsession.flush()


def get_question_type(request, name):
    return request.dbsession.query(QuestionType).filter(QuestionType.name == name).first()


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
    experiment = Experiment(attributes={'title': 'Experiment 1',
                                        'description': 'The first test experiment',
                                        'status': 'development'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    return experiment


def create_experiment_2(request):
    user = create_user_1(request)
    experiment = Experiment(attributes={'title': 'Experiment 2',
                                        'description': 'The second test experiment',
                                        'status': 'development'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    page1 = Page(experiment=experiment, attributes={'name': 'welcome', 'title': 'Welcome'})
    request.dbsession.add(page1)
    page2 = Page(experiment=experiment, attributes={'name': 'consent', 'title': 'Informed Consent'})
    request.dbsession.add(page2)
    request.dbsession.add(Transition(source=page1, target=page2, attributes={}))
    return experiment


def create_experiment_3(request):
    experiment = Experiment(external_id='experiment-3',
                            attributes={'title': 'Experiment 3',
                                        'description': 'A complete experiment',
                                        'status': 'live'})
    request.dbsession.add(experiment)
    welcome = Page(experiment=experiment, attributes={'name': 'welcome', 'title': 'Welcome'})
    welcome.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                      position=1,
                                      attributes={'content': '<p>Welcome to this experiment</p>',
                                                  'format': 'text/html'}))
    experiment.first_page = welcome
    request.dbsession.add(welcome)
    consent = Page(experiment=experiment, attributes={'name': 'consent', 'title': 'Informed Consent'})
    consent.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                      position=1,
                                      attributes={'content': '<p>To participate, please give your consent</p>',
                                                  'format': 'text/html'}))
    consent.questions.append(Question(question_type=get_question_type(request, 'ESSMultiChoiceGrid'),
                                      position=2,
                                      attributes={'title': '',
                                                  'name': 'consent',
                                                  'required': True,
                                                  'rowValues': ['information', 'voluntary', 'understand'],
                                                  'rowLabels': ['I have read and understood the study information',
                                                                'I participate voluntarily in this study',
                                                                'I understand that participating requires ' +
                                                                'answering some questions'],
                                                  'columnValues': ['yes'],
                                                  'columnLabels': ['Yes']}))
    request.dbsession.add(consent)
    request.dbsession.add(Transition(source=welcome, target=consent, attributes={}))
    demographics = Page(experiment=experiment, attributes={'name': 'demographics', 'title': 'About you'})
    demographics.questions.append(Question(question_type=get_question_type(request, 'ESSSingleChoice'),
                                           position=1,
                                           attributes={'title': 'Please select your age',
                                                       'name': 'age',
                                                       'required': True,
                                                       'values': ['age0', 'age1', 'age2'],
                                                       'labels': ['< 18', '18 - 65', '> 65'],
                                                       'display': 'vertical list'}))
    demographics.questions.append(Question(question_type=get_question_type(request, 'ESSMultiChoice'),
                                           position=2,
                                           attributes={'title': 'Please select your hobbies',
                                                       'name': 'hobbies',
                                                       'required': True,
                                                       'values': ['fishing', 'swimming', 'sitting'],
                                                       'labels': ['Fishing', 'Swimming', 'Sitting'],
                                                       'display': 'vertical list'}))
    request.dbsession.add(demographics)
    request.dbsession.add(Transition(source=consent, target=demographics, attributes={}))
    task = Page(experiment=experiment, attributes={'name': 'task', 'title': 'Task'})
    task.questions.append(Question(question_type=get_question_type(request, 'ESSSingleChoiceGrid'),
                                   position=1,
                                   attributes={'title': '',
                                               'name': 'feelings',
                                               'required': True,
                                               'rowValues': ['sad', 'happy'],
                                               'rowLabels': ['I feel sad',
                                                             'I feel happy'],
                                               'columnValues': ['0', '1', '2', '3', '4'],
                                               'columnLabels': ['1', '2', '3', '4', '5']}))
    request.dbsession.add(task)
    request.dbsession.add(Transition(source=demographics, target=task, attributes={}))
    thank_you = Page(experiment=experiment, attributes={'name': 'thank_you', 'title': 'Thank you'})
    thank_you.questions.append(Question(question_type=get_question_type(request, 'ESSMultiLineInput'),
                                        position=1,
                                        attributes={'title': 'Please leave any comments you have',
                                                    'name': 'comments',
                                                    'required': True}))
    thank_you.questions.append(Question(question_type=get_question_type(request, 'ESSSingleLineInput'),
                                        position=1,
                                        attributes={'title': 'Please leave your e-mail address',
                                                    'name': 'email',
                                                    'required': True}))
    request.dbsession.add(thank_you)
    request.dbsession.add(Transition(source=task, target=thank_you, attributes={}))
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
            elif obj == 'experiment3':
                create_experiment_3(request)
    return {}
