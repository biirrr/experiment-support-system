from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from secrets import token_hex
from sqlalchemy import and_

from ess.models import Experiment, Participant


@view_config(route_name='api.external.participant.collection.post', renderer='json')
@require_permission('Experiment:external_id:eid allow $current_user participate')
def external_post_collection(request):
    """Handles creating a new :class:`~ess.models.participant.Participant`."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
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
    raise HTTPNotFound()


@view_config(route_name='api.external.participant.item.get', renderer='json')
@require_permission('Experiment:external_id:eid allow $current_user participate')
def external_get_item(request):
    """Handles fetching a single :class:`~ess.models.participant.Participant`."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment is not None:
        item = request.dbsession.query(Participant)\
            .join(Participant.experiment)\
            .filter(and_(Participant.external_id == request.matchdict['iid'],
                         Experiment.external_id == request.matchdict['eid']))\
            .first()
        if item is not None:
            return {'data': item.as_jsonapi()}
    raise HTTPNotFound()
