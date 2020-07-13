from copy import deepcopy
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPNoContent
from pyramid.view import view_config

from ess.models import ExperimentPermission
from . import (validated_body, type_schema, id_schema, relationship_schema, store_object)


post_permission_schema = {'type': type_schema('experiment-permissions'),
                          'attributes': {'type': 'dict',
                                         'required': True,
                                         'schema': {'role': {'type': 'string',
                                                             'required': True,
                                                             'empty': False,
                                                             'allowed': ['owner', 'author', 'tester']}}},
                          'relationships': {'type': 'dict',
                                            'schema': {'user': relationship_schema('users'),
                                                       'experiment': relationship_schema('experiments')}}}


@view_config(route_name='api.backend.experiment_permission.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user admin')
def backend_post_collection(request):
    """Handles creating a new :class:`~ess.models.experiment_permisssion.ExperimentPermission`."""
    schema = deepcopy(post_permission_schema)
    schema['relationships']['schema']['experiment'] = relationship_schema('experiments',
                                                                          fixed_value=request.matchdict['eid'])
    body = validated_body(request, schema)
    obj = store_object(request, body, overrides={'role': body['data']['attributes']['role']})
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.backend.experiment_permission.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_item(request):
    """Handles fetching a single :class:`~ess.models.experiment_permission.ExperimentPermission`."""
    permission = request.dbsession.query(ExperimentPermission)\
        .filter(ExperimentPermission.id == request.matchdict['iid']).first()
    if permission is not None:
        return {'data': permission.as_jsonapi()}
    raise HTTPNotFound()


patch_permission_schema = {'type': type_schema('experiment-permissions'),
                           'id': id_schema(),
                           'attributes': {'type': 'dict',
                                          'required': True,
                                          'schema': {'role': {'type': 'string',
                                                              'required': True,
                                                              'empty': False,
                                                              'allowed': ['owner', 'author', 'tester']}}},
                           'relationships': {'type': 'dict',
                                             'schema': {'user': relationship_schema('users'),
                                                        'experiment': relationship_schema('experiments')}}}


@view_config(route_name='api.backend.experiment_permission.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user admin')
def backend_patch_item(request):
    """Handles updating an :class:`~ess.models.experiment_permisssion.ExperimentPermission`."""
    permission = request.dbsession.query(ExperimentPermission)\
        .filter(ExperimentPermission.id == request.matchdict['iid']).first()
    if permission is not None:
        schema = deepcopy(patch_permission_schema)
        schema['id'] = id_schema(fixed_value=str(permission.id))
        schema['relationships']['schema']['user'] = relationship_schema(
            'users',
            fixed_value=str(permission.user_id))
        schema['relationships']['schema']['experiment'] = relationship_schema(
            'experiments',
            fixed_value=str(permission.experiment_id))
        body = validated_body(request, schema)
        obj = store_object(request, body, overrides={'role': body['data']['attributes']['role']})
        return {'data': obj.as_jsonapi()}
    raise HTTPNotFound()


@view_config(route_name='api.backend.experiment_permission.item.delete', renderer='json')
@require_permission('Experiment:eid allow $current_user admin')
def backend_delete_item(request):
    """Handles deleting an :class:`~ess.models.experiment_permisssion.ExperimentPermission`."""
    permission = request.dbsession.query(ExperimentPermission)\
        .filter(ExperimentPermission.id == request.matchdict['iid']).first()
    if permission is not None:
        request.dbsession.delete(permission)
        return HTTPNoContent()
    raise HTTPNotFound()
