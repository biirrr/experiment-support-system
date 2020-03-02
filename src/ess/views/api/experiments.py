from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Experiment
from ess.permissions import require_permission
from ess.routes import decode_route
from ess.util import Validator



edit_experiment_schema = {'title': {'type': 'string', 'empty': False},
                          'description': {'type': 'string'}}


@view_config(route_name='api.experiment.item.get', renderer='json')
@require_permission('admin.experiments or @edit experiment :id')
def get_item(request):
    """Handles the creation of a new experiment."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['id']).first()
    if experiment is not None:
        return {'data': experiment.as_jsonapi()}
    else:
        raise HTTPNotFound()
