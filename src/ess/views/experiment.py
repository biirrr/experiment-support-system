from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPFound, HTTPNotFound
from pyramid.view import view_config
from uuid import uuid4

from ..models import Experiment, ExperimentPermission
from ..util import Validator


create_experiment_schema = {'title': {'type': 'string', 'empty': False},
                            'description': {'type': 'string'},
                            'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='experiment.create', renderer='ess:templates/experiment/create.jinja2')
@require_permission('$current_user has_permission experiment.create')
def create(request):
    """Handles the creation of a new experiment."""
    if request.method == 'POST':
        validator = Validator(create_experiment_schema)
        if validator.validate(request.params):
            uuid = uuid4()
            while request.dbsession.query(Experiment).filter(Experiment.external_id == uuid.hex).first():
                uuid = uuid4()
            experiment = Experiment(external_id=uuid.hex,
                                    attributes={'title': request.params['title'],
                                                'description': request.params['description'],
                                                'status': 'development'})
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


@view_config(route_name='experiment.edit', renderer='ess:templates/experiment/edit.jinja2')
@require_permission('Experiment:eid allow $current_user edit')
def edit(request):
    """Handles the creation of a new experiment."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['eid']).first()
    if experiment:
        return {'experiment': experiment}
    else:
        raise HTTPNotFound()
