from copy import deepcopy
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Page
from ess.permissions import require_permission
from . import (validated_body, override_tree, type_schema, id_schema, relationship_schema, store_object)


post_page_schema = {'type': type_schema('pages'),
                    'attributes': {'type': 'dict',
                                   'required': True,
                                   'schema': {'name': {'type': 'string',
                                                       'required': True,
                                                       'empty': False,
                                                       'regex': '[a-zA-Z0-9_]+'},
                                              'title': {'type': 'string',
                                                        'required': True,
                                                        'empty': False}}},
                    'relationships': {'type': 'dict',
                                      'schema': {'experiment': relationship_schema('experiments')}}}


@view_config(route_name='api.page.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def post_collection(request):
    """Handles fetching a single :class:`~ess.models.page.Page`."""
    def validate_unique_name(field, value, error):
        for page in request.dbsession.query(Page).filter(Page.experiment_id == request.matchdict['eid']):
            if page.attributes['name'] == value:
                error(field, 'Page names must be unique')

    schema = deepcopy(post_page_schema)
    schema['attributes']['schema']['name']['validator'] = [validate_unique_name]
    body = validated_body(request, schema)
    body = override_tree(body, {'data.relationships.experiment': {
        'data': {'type': 'experiments',
                 'id': request.matchdict['eid']}}})
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.page.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.page.Page`."""
    item = request.dbsession.query(Page).filter(and_(Page.id == request.matchdict['pid'],
                                                     Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


patch_page_schema = {'type': type_schema('pages'),
                     'id': id_schema(),
                     'attributes': {'type': 'dict',
                                    'required': True,
                                    'schema': {'name': {'type': 'string',
                                                        'required': True,
                                                        'empty': False,
                                                        'regex': '[a-zA-Z0-9_]+'},
                                               'title': {'type': 'string',
                                                         'required': True,
                                                         'empty': False}}},
                     'relationships': {'type': 'dict',
                                       'required': True,
                                       'schema': {'experiment': relationship_schema('experiments',
                                                                                    required=True),
                                                  'next': relationship_schema('transitions',
                                                                              required=True,
                                                                              many=True),
                                                  'prev': relationship_schema('transitions',
                                                                              required=True,
                                                                              many=True),
                                                  'questions': relationship_schema('questions',
                                                                                   required=True,
                                                                                   many=True)}}}


@view_config(route_name='api.page.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def patch_item(request):
    """Handles updating a single :class:`~ess.models.page.Page`."""
    def validate_unique_name(field, value, error):
        for page in request.dbsession.query(Page).filter(and_(Page.experiment_id == request.matchdict['eid'],
                                                              Page.id != request.matchdict['pid'])):
            if page.attributes['name'] == value:
                error(field, 'Page names must be unique')

    schema = deepcopy(patch_page_schema)
    schema['attributes']['schema']['name']['validator'] = [validate_unique_name]
    body = validated_body(request, schema)
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}
