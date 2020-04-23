from copy import deepcopy
from email_validator import validate_email, EmailNotValidError
from hashlib import sha512
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config
from random import sample, choice
from secrets import token_hex
from sqlalchemy import and_, desc

from ..models import User, Experiment, ExperimentPermission
from ..permissions import require_permission
from ..routes import decode_route
from ..util import get_config_setting, send_email, Validator


def valid_email(field, value, error):
    """Validates that the ``value`` in ``field`` is a valid e-mail address.

    :param field: The field being validated
    :type field: str
    :param value: The field value to validate
    :param error: Callback to set the error message, if the ``value`` is not valid
    """
    try:
        validate_email(value, check_deliverability=False)
    except EmailNotValidError as e:
        error(field, str(e))


register_schema = {'email': {'type': 'string',
                             'required': True,
                             'validator': [valid_email]},
                   'name': {'type': 'string',
                            'required': True,
                            'empty': False},
                   'icon': {'type': 'string',
                            'required': True,
                            'allowed': []},
                   'csrf_token': {'type': 'string',
                                  'empty': False}}
VALIDATION_ICONS = [('pencil', 'pencil'), ('anvil', 'anvil'), ('tree', 'tree'), ('water', 'water'), ('cloud', 'cloud'),
                    ('flower', 'flower'), ('elephant', 'elephant'), ('airplane', 'plane'),
                    ('airballoon', 'hot air balloon'), ('bus', 'bus'), ('fingerprint', 'fingerprint'),
                    ('phone', 'phone'), ('star', 'star'), ('watch', 'watch'), ('food-apple', 'apple')]


@view_config(route_name='user.register', renderer='ess:templates/user/register.jinja2')
def register(request):
    """Handles the registration of new users."""
    if request.method == 'POST':
        def nonexistant_email(field, value, error):
            """Checks that the ``value`` in ``field`` is not already registered.
            """
            if request.dbsession.query(User).filter(User.email == value).first():
                error(field, 'This e-mail address is already registered.')

        schema = deepcopy(register_schema)
        schema['email']['validator'].append(nonexistant_email)
        if 'verification_id' in request.session:
            schema['icon']['allowed'].append(request.session['verification_id'])
        validator = Validator(schema)
        if validator.validate(request.params):
            user = User(email=request.params['email'].lower(),
                        salt=None,
                        password=None,
                        status='new',
                        trust='low',
                        groups=[],
                        permissions=[],
                        attributes={'validation_token': token_hex(32),
                                    'name': request.params['name']})
            if request.dbsession.query(User).count() == 0:
                user.groups.append('admin')
                user.trust = 'full'
            request.dbsession.add(user)
            request.session.flash('You have registered. You should shortly receive a confirmation e-mail.', 'info')
            send_email(request, user.email, get_config_setting(request,
                                                               'app.email.sender',
                                                               default='admin@the-old-joke-archive.org'),
                       'Confirm your registration with the Experiment Support System', '''Dear %(name)s,

Welcome to the Experiment Support System. We just need to confirm your e-mail address.
Please click on the following link or copy it into your browser:

%(url)s

Thank you,
Experiment Support System
''' % {'name': user.attributes['name'], 'url': request.route_url('user.confirm',
                                                                 email=user.email,
                                                                 token=user.attributes['validation_token'])})
            return HTTPFound(location=request.route_url('root'))
        else:
            verification_icons = list(enumerate(sample(VALIDATION_ICONS, 7)))
            selected_icon = choice(verification_icons[1:])
            request.session['verification_id'] = str(selected_icon[0])
            return {'errors': validator.errors,
                    'values': request.params,
                    'verification_icons': verification_icons,
                    'selected_icon': selected_icon[1]}
    verification_icons = list(enumerate(sample(VALIDATION_ICONS, 7)))
    selected_icon = choice(verification_icons[1:])
    request.session['verification_id'] = selected_icon[0]
    return {'errors': {},
            'verification_icons': verification_icons,
            'selected_icon': selected_icon[1]}


confirmation_schema = {'password': {'type': 'string', 'empty': False},
                       'confirm_password': {'type': 'string', 'empty': False, 'matches': 'password'},
                       'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='user.confirm', renderer='ess:templates/user/confirm.jinja2')
def confirm(request):
    """Handles the user confirmation and setting a new password. Users are automatically logged in."""
    user = request.dbsession.query(User).filter(User.email == request.matchdict['email']).first()
    if user and 'validation_token' in user.attributes and \
            user.attributes['validation_token'] == request.matchdict['token']:
        if request.method == 'POST':
            validator = Validator(confirmation_schema)
            if validator.validate(request.params):
                user.salt = token_hex(32)
                hash = sha512()
                hash.update(user.salt.encode('utf-8'))
                hash.update(b'$$')
                hash.update(request.params['password'].encode('utf-8'))
                user.password = hash.hexdigest()
                user.status = 'active'
                del user.attributes['validation_token']
                request.session['user-id'] = user.id
                request.session.flash('You have updated your password.', 'info')
                return HTTPFound(location=request.route_url('root'))
            else:
                return {'user': user,
                        'errors': validator.errors,
                        'values': request.params}
        return {'user': user}
    else:
        request.session.flash('Unfortunately that validation token is not valid for that e-mail address.', queue='info')
        return HTTPFound(location=request.route_url('root'))


login_schema = {'email': {'type': 'string', 'empty': False, 'validator': valid_email},
                'password': {'type': 'string', 'empty': False},
                'redirect': {'type': 'string'},
                'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='user.login', renderer='ess:templates/user/login.jinja2')
def login(request):
    """Handle logging the user in."""
    if request.method == 'POST':
        validator = Validator(login_schema)
        if validator.validate(request.params):
            user = request.dbsession.query(User).filter(and_(User.email == request.params['email'].lower(),
                                                             User.status == 'active')).first()
            if user:
                hash = sha512()
                hash.update(user.salt.encode('utf-8'))
                hash.update(b'$$')
                hash.update(request.params['password'].encode('utf-8'))
                if user.password == hash.hexdigest():
                    request.session['user-id'] = user.id
                    return HTTPFound(location=decode_route(request, 'user.view', {'uid': user.id}))
            return {'errors': {'email': ['Either there is no user with this e-mail address ' +
                                         'or the password is incorrect.'],
                               'password': ['Either there is no user with this e-mail address ' +
                                            'or the password is incorrect.']},
                    'values': request.params}
        else:
            return {'errors': validator.errors, 'values': request.params}
    return {}


forgotten_password_schema = {'email': {'type': 'string', 'empty': False, 'validator': valid_email},
                             'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='user.forgotten_password', renderer='ess:templates/user/forgotten_password.jinja2')
def forgotten_password(request):
    """Handle sending a link for a forgotten password."""
    if request.method == 'POST':
        validator = Validator(login_schema)
        if validator.validate(request.params):
            user = request.dbsession.query(User).filter(and_(User.email == request.params['email'].lower(),
                                                             User.status == 'active')).first()
            if user:
                user.attributes['validation_token'] = token_hex(32)
                request.dbsession.add(user)
                send_email(request, user.email, get_config_setting(request,
                                                                   'app.email.sender',
                                                                   default='admin@the-old-joke-archive.org'),
                           'Reset your password at the Experiment Support System', '''Dear %(name)s,

You have asked to have your password reset. To do so, plese click on the following link or copy it into your browser:

%(url)s

If you did not request this, then probably somebody is blindly trying e-mail addresses. As long as this person has
no access to your e-mail account, they will neither be able to reset your password, nor to find out that this e-mail
address works.

Thank you,
Experiment Support System
''' % {'name': user.attributes['name'], 'url': request.route_url('user.confirm',
                                                                 email=user.email,
                                                                 token=user.attributes['validation_token'])})
            request.session.flash('An email with a password reset link has been sent to the email address.', 'info')
            return HTTPFound(request.route_url('root'))
        else:
            return {'errors': validator.errors, 'values': request.params}
    return {}


@view_config(route_name='user.logout', renderer='ess:templates/user/logout.jinja2')
def logout(request):
    """Handle logging the user out."""
    if request.method == 'POST':
        request.session.clear()
        return HTTPFound(location=request.route_url('root'))
    return {}


@view_config(route_name='user.view', renderer='ess:templates/user/view.jinja2')
@require_permission('User:uid allow $current_user view')
def view(request):
    """Handle showing the user overview page."""
    return {}


@view_config(route_name='user.experiments', renderer='ess:templates/user/experiments.jinja2')
@require_permission('User:uid allow $current_user view')
def experiments(request):
    """Handle showing the user experiments page."""
    experiments = request.dbsession.query(Experiment).\
        join(ExperimentPermission).\
        filter(ExperimentPermission.user_id == request.current_user.id).\
        order_by(desc(Experiment.updated), desc(Experiment.created))
    return {'experiments': experiments}
