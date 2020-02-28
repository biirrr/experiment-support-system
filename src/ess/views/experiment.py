from copy import deepcopy
from email_validator import validate_email, EmailNotValidError
from hashlib import sha512
from math import ceil
from pyramid.httpexceptions import HTTPFound, HTTPNotFound
from pyramid.view import view_config
from random import sample, choice
from secrets import token_hex
from sqlalchemy import and_

from ..models import Experiment, ExperimentPermission
from ..permissions import require_permission, check_permission, PERMISSIONS, GROUPS
from ..routes import decode_route
from ..util import get_config_setting, send_email, Validator


create_experiment_schema = {'title': {'type': 'string', 'empty': False},
                            'description': {'type': 'string'},
                            'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='experiment.create', renderer='ess:templates/experiment/create.jinja2')
def create(request):
    """Handles the creation of a new experiment."""
    if request.method == 'POST':
        validator = Validator(create_experiment_schema)
        if validator.validate(request.params):
            experiment = Experiment(title=request.params['title'],
                                    description=request.params['description'],
                                    status='development')
            permission = ExperimentPermission(user=request.current_user,
                                              experiment=experiment,
                                              role='owner')
            request.dbsession.add(experiment)
            request.dbsession.add(permission)
            request.dbsession.flush()
            return HTTPFound(request.route_url('experiment.edit', eid=experiment.id))
        else:
            return {'errors': validator.errors, 'values': request.params}
    return {}
