import json

from copy import deepcopy
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPNoContent
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Transition, Page, Experiment
from . import (validated_body, id_schema, type_schema, relationship_schema, store_object)


post_transition_schema = {'type': type_schema('transitions'),
                          'attributes': {
                              'type': 'dict',
                              'required': True,
                              'schema': {
                                  'condition': {
                                      'type': 'string',
                                      'required': True,
                                      'allowed': ['unconditional', 'answer']
                                  },
                                  'page_id': {
                                      'type': 'string',
                                  },
                                  'question_id': {
                                      'type': 'string',
                                  },
                                  'operator': {
                                      'type': 'string',
                                      'allowed': ['eq', 'neq']
                                  },
                                  'value': {
                                      'type': 'string',
                                  },
                              }
                          },
                          'relationships': {'type': 'dict',
                                            'schema': {'source': relationship_schema('pages'),
                                                       'target': relationship_schema('pages')}}}


@view_config(route_name='api.backend.transition.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_post_collection(request):
    """Handles fetching creating a new :class:`~ess.models.transition.Transition`."""
    body = validated_body(request, post_transition_schema)
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.backend.transition.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_item(request):
    """Handles fetching a single :class:`~ess.models.page.Transition` for the backend api."""
    item = request.dbsession.query(Transition).join(Transition.source)\
        .filter(and_(Transition.id == request.matchdict['iid'],
                     Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


@view_config(route_name='api.external.transition.item.get', renderer='json')
@require_permission('Experiment:external_id:eid allow $current_user participate')
def external_get_item(request):
    """Handles fetching a single :class:`~ess.models.page.Transition` for the external api."""
    item = request.dbsession.query(Transition).join(Transition.source).join(Page.experiment)\
        .filter(and_(Transition.id == request.matchdict['iid'],
                     Experiment.external_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi(external=True)}
    else:
        raise HTTPNotFound()


patch_transition_schema = {'type': type_schema('transitions'),
                           'attributes': {
                               'type': 'dict',
                               'required': True,
                               'schema': {
                                  'condition': {
                                      'type': 'string',
                                      'required': True,
                                      'allowed': ['unconditional', 'answer']
                                  },
                                  'page_id': {
                                      'type': 'string',
                                  },
                                  'question_id': {
                                      'type': 'string',
                                  },
                                  'operator': {
                                      'type': 'string',
                                      'allowed': ['eq', 'neq']
                                  },
                                  'value': {
                                      'type': 'string',
                                  },
                               }
                           },
                           'relationships': {'type': 'dict',
                                             'required': True,
                                             'schema': {'source': relationship_schema('pages'),
                                                        'target': relationship_schema('pages')}}}


@view_config(route_name='api.backend.transition.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_patch_item(request):
    """Handles updating a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Transition).join(Transition.source).\
        filter(and_(Transition.id == request.matchdict['iid'],
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


@view_config(route_name='api.backend.transition.item.delete', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_delete_item(request):
    """Handles deleting a single :class:`~ess.models.transition.Transition`."""
    item = request.dbsession.query(Transition).join(Transition.source).\
        filter(and_(Transition.id == request.matchdict['iid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        request.dbsession.delete(item)
        return HTTPNoContent()
    else:
        raise HTTPNotFound()
