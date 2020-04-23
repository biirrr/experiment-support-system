from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Transition, Page
from ess.permissions import require_permission
from . import (validated_body, type_schema, relationship_schema, store_object)


post_transition_schema = {'type': type_schema('transitions'),
                          'attributes': {'type': 'dict',
                                         'required': True,
                                         'schema': {}},
                          'relationships': {'type': 'dict',
                                            'schema': {'source': relationship_schema('pages'),
                                                       'target': relationship_schema('pages')}}}


@view_config(route_name='api.transition.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def post_collection(request):
    """Handles fetching a single :class:`~ess.models.page.Page`."""
    body = validated_body(request, post_transition_schema)
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.transition.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.page.Transition`."""
    item = request.dbsession.query(Transition).join(Transition.source).\
        filter(and_(Transition.id == request.matchdict['tid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()
