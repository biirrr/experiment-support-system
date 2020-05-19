import json

from copy import deepcopy
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPNoContent
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Transition, Page
from . import (validated_body, id_schema, type_schema, relationship_schema, store_object)


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


patch_transition_schema = {'type': type_schema('transitions'),
                           'attributes': {'type': 'dict',
                                          'required': True,
                                          'schema': {}},
                           'relationships': {'type': 'dict',
                                             'required': True,
                                             'schema': {'source': relationship_schema('pages'),
                                                        'target': relationship_schema('pages')}}}


@view_config(route_name='api.transition.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def patch_item(request):
    """Handles updating a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Transition).join(Transition.source).\
        filter(and_(Transition.id == request.matchdict['tid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        schema = deepcopy(patch_transition_schema)
        schema['id'] = id_schema(str(item.id))
        body = validated_body(request, schema)
        if not request.dbsession.query(Page).\
            filter(and_(Page.id == body['data']['relationships']['source']['data']['id'],
                        Page.experiment_id == request.matchdict['eid'])).first():
            raise HTTPBadRequest(body=json.dumps({'errors': [{'title': 'Source page not found',
                                                              'source': {'pointer': '/data/relationships/source'}}]}))
        if not request.dbsession.query(Page).\
            filter(and_(Page.id == body['data']['relationships']['target']['data']['id'],
                        Page.experiment_id == request.matchdict['eid'])).first():
            raise HTTPBadRequest(body=json.dumps({'errors': [{'title': 'Target page not found',
                                                              'source': {'pointer': '/data/relationships/target'}}]}))
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    else:
        raise HTTPNotFound()


@view_config(route_name='api.transition.item.delete', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def delete_item(request):
    """Handles updating a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Transition).join(Transition.source).\
        filter(and_(Transition.id == request.matchdict['tid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        request.dbsession.delete(item)
        return HTTPNoContent()
    else:
        raise HTTPNotFound()
