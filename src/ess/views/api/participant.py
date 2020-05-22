from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from secrets import token_hex
from sqlalchemy import and_

from ess.models import Experiment, Participant


@view_config(route_name='api.participant.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user participate')
def post_collection(request):
    """Handles creating a new :class:`~ess.models.participant.Participant`."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['eid']).first()
    if experiment is not None:
        external_id = token_hex(32)
        while request.dbsession.query(Participant).filter(Participant.external_id == external_id).first():
            external_id = token_hex(32)
        item = Participant(experiment=experiment,
                           external_id=external_id,
                           attributes={},
                           responses={})
        request.dbsession.add(item)
        request.dbsession.flush()
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


@view_config(route_name='api.participant.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user participate')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.participant.Participant`."""
    item = request.dbsession.query(Participant).\
        filter(and_(Participant.external_id == request.matchdict['pid'],
                    Participant.experiment_id == request.matchdict['eid'])).\
        first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()
