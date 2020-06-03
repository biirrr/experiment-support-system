from pwh_permissions import permitted
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from pyramid.view import view_config
from secrets import token_hex
from sqlalchemy import and_

from ess.models import Experiment, Participant


@view_config(route_name='experiment.run.api.participant.collection.post', renderer='json')
def post_collection(request):
    """Handles creating a new :class:`~ess.models.participant.Participant`."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment is not None:
        if permitted('experiment allow current_user participate', {'experiment': experiment,
                                                                   'current_user': request.current_user}):
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
            raise HTTPForbidden()
    raise HTTPNotFound()


@view_config(route_name='experiment.run.api.participant.item.get', renderer='json')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.participant.Participant`."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment is not None:
        if permitted('experiment allow current_user participate', {'experiment': experiment,
                                                                   'current_user': request.current_user}):
            item = request.dbsession.query(Participant)\
                .join(Participant.experiment)\
                .filter(and_(Participant.external_id == request.matchdict['pid'],
                             Experiment.external_id == request.matchdict['eid']))\
                .first()
            if item is not None:
                return {'data': item.as_jsonapi()}
        else:
            raise HTTPForbidden()
    raise HTTPNotFound()
