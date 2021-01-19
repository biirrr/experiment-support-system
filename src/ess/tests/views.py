import json

from hashlib import sha512
from pkg_resources import resource_string
from secrets import token_hex

from ess.models import (User, Experiment, ExperimentPermission, Page, Transition, QuestionTypeGroup, QuestionType,
                        Question, Setting)
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

    request.dbsession.add(Setting(key='registration.mode',
                                  value='open',
                                  values=['open', 'domain', 'admin'],
                                  guidance='Set the registration mode to allow anybody (open), users with an e-mail ' +
                                           'in one ore more listed domains (domain), or registration only by admin ' +
                                           'users (admin).'))
    request.dbsession.add(Setting(key='registration.domains',
                                  value='',
                                  values=None,
                                  guidance='Set the domains that users may register from. Only used if the ' +
                                           'registration.mode is set to domain.'))
    request.dbsession.add(Setting(key='registration.admin_confirmation',
                                  value='false',
                                  values=['true', 'false'],
                                  guidance='Whether after registration an administrator needs to confirm the ' +
                                           'registration.'))
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


def create_user_2(request):
    user = request.dbsession.query(User).filter(User.email == 'test2@example.com').first()
    if not user:
        user = User(email='test2@example.com')
        user.salt = token_hex(32)
        hash = sha512()
        hash.update(user.salt.encode('utf-8'))
        hash.update(b'$$test2')
        user.password = hash.hexdigest()
        user.status = 'active'
        user.permissions = []
        user.groups = ['admin', 'creator']
        user.attributes = {'name': 'Test 2'}
    request.dbsession.add(user)
    return user


def create_experiment_1(request):
    """Experiment 1 is an empty experiment."""
    user = create_user_1(request)
    experiment = Experiment(attributes={'title': 'Experiment 1',
                                        'description': 'The first test experiment',
                                        'status': 'development'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    return experiment


def create_experiment_2(request):
    """Experiment 2 is a two-page experiment with two empty pages."""
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
    """Experiment 3 is a multi-page experiment that contains all types of questions."""
    user = create_user_1(request)
    experiment = Experiment(external_id='experiment-3',
                            attributes={'title': 'Experiment 3',
                                        'description': 'A complete experiment',
                                        'status': 'live'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
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


def create_experiment_4(request):
    """Experiment 4 is a multi-page experiment with conditional questions."""
    user = create_user_1(request)
    experiment = Experiment(external_id='experiment-4',
                            attributes={'title': 'Experiment 4',
                                        'description': 'The fourth test experiment',
                                        'status': 'development'})
    request.dbsession.add(experiment)
    owner = ExperimentPermission(experiment=experiment, user=user, role='owner')
    request.dbsession.add(owner)
    page1 = Page(experiment=experiment, attributes={'name': 'page1', 'title': 'Page 1 - Conditional on SingleChoice'})
    question1 = Question(question_type=get_question_type(request, 'ESSSingleChoice'),
                         position=1,
                         attributes={'values': ['0', '1', '2'],
                                     'labels': ['A', 'B', 'C'],
                                     'required': True,
                                     'display': 'vertical list'})
    page1.questions.append(question1)
    request.dbsession.flush()
    request.dbsession.add(question1)
    page1.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question1.id),
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page1.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question1.id),
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page1.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question1.id),
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    experiment.first_page = page1
    request.dbsession.add(page1)
    page2 = Page(experiment=experiment, attributes={'name': 'page2', 'title': 'Page 2 - Conditional on MultiChoice'})
    request.dbsession.add(Transition(source=page1, target=page2, attributes={}))
    question2 = Question(question_type=get_question_type(request, 'ESSMultiChoice'),
                         position=1,
                         attributes={'values': ['0', '1', '2'],
                                     'labels': ['A', 'B', 'C'],
                                     'required': True,
                                     'display': 'vertical list'})
    page2.questions.append(question2)
    request.dbsession.flush()
    request.dbsession.add(question2)
    page2.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question2.id),
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page2.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question2.id),
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page2.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question2.id),
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    page3 = Page(experiment=experiment, attributes={'name': 'page3', 'title': 'Page 3 - Conditional on Input'})
    request.dbsession.add(Transition(source=page2, target=page3, attributes={}))
    question3 = Question(question_type=get_question_type(request, 'ESSSingleLineInput'),
                         position=1,
                         attributes={'title': 'What is 1 + 2',
                                     'required': True})
    page3.questions.append(question3)
    request.dbsession.flush()
    request.dbsession.add(question3)
    page3.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>That is correct</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question3.id),
                                                                   'operator': 'eq',
                                                                   'value': '3'}}))
    page4 = Page(experiment=experiment, attributes={'name': 'page4',
                                                    'title': 'Page 4 - Conditional on SingleChoiceGrid'})
    request.dbsession.add(Transition(source=page3, target=page4, attributes={}))
    question4 = Question(question_type=get_question_type(request, 'ESSSingleChoiceGrid'),
                         position=1,
                         attributes={'columnValues': ['0', '1', '2'],
                                     'columnLabels': ['A', 'B', 'C'],
                                     'rowValues': ['q1', 'q2'],
                                     'rowLabels': ['Question 1', 'Question 2'],
                                     'required': True})
    page4.questions.append(question4)
    request.dbsession.flush()
    request.dbsession.add(question4)
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page4.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question4.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    page5 = Page(experiment=experiment, attributes={'name': 'page5',
                                                    'title': 'Page 5 - Conditional on MultiChoiceGrid'})
    request.dbsession.add(Transition(source=page4, target=page5, attributes={}))
    question5 = Question(question_type=get_question_type(request, 'ESSMultiChoiceGrid'),
                         position=1,
                         attributes={'columnValues': ['0', '1', '2'],
                                     'columnLabels': ['A', 'B', 'C'],
                                     'rowValues': ['q1', 'q2'],
                                     'rowLabels': ['Question 1', 'Question 2'],
                                     'required': True})
    page5.questions.append(question5)
    request.dbsession.flush()
    request.dbsession.add(question5)
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q1: You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q1',
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected A</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '0'}}))
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected B</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '1'}}))
    page5.questions.append(Question(question_type=get_question_type(request, 'ESSDisplay'),
                                    position=1,
                                    attributes={'content': '<p>Q2: You selected C</p>',
                                                'format': 'text/html',
                                                'essConditional': {'question': str(question5.id),
                                                                   'subQuestion': 'q2',
                                                                   'operator': 'eq',
                                                                   'value': '2'}}))
    return experiment


def create_experiment_5(request):
    """Creates the full experiment 3, but sets the status to development."""
    experiment = create_experiment_3(request)
    experiment.attributes['status'] = 'development'
    experiment.attributes['title'] = 'Experiment 5'
    experiment.external_id = 'experiment-5'
    return experiment


def create_experiment_6(request):
    """Creates the full experiment 4, but sets the status to live."""
    experiment = create_experiment_4(request)
    experiment.attributes['status'] = 'live'
    experiment.attributes['title'] = 'Experiment 6'
    experiment.external_id = 'experiment-6'
    return experiment


objects = {'user1': create_user_1,
           'user2': create_user_2,
           'experiment1': create_experiment_1,
           'experiment2': create_experiment_2,
           'experiment3': create_experiment_3,
           'experiment4': create_experiment_4,
           'experiment5': create_experiment_5,
           'experiment6': create_experiment_6,
           }


def create(request):
    """Handles setting up the test fixtures"""
    init_db(request)
    if 'setting' in request.params:
        for update_setting in request.params.getall('setting'):
            key, value = update_setting.split(':')
            setting = request.dbsession.query(Setting).filter(Setting.key == key).first()
            if setting:
                setting.value = value
        request.dbsession.flush()
    if 'obj' in request.params:
        for obj in request.params.getall('obj'):
            if obj in objects:
                objects[obj](request)
    return {}
