from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from ess.models import Experiment
from . import (validated_body, type_schema, id_schema, relationship_schema, store_object)


edit_experiment_schema = {'title': {'type': 'string', 'empty': False},
                          'description': {'type': 'string'}}


@view_config(route_name='api.experiment.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.experiment.Experiment`."""
    item = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['eid']).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


patch_experiment_schema = {'type': type_schema('experiments'),
                           'id': id_schema(),
                           'attributes': {'type': 'dict',
                                          'required': True,
                                          'schema': {'title': {'type': 'string',
                                                               'required': True,
                                                               'empty': False},
                                                     'description': {'type': 'string',
                                                                     'required': True,
                                                                     'empty': False},
                                                     'status': {'type': 'string',
                                                                'required': True,
                                                                'allowed': ['development', 'live',
                                                                            'paused', 'completed']}}},
                           'relationships': {'type': 'dict',
                                             'schema': {'first-page': relationship_schema('pages'),
                                                        'pages': relationship_schema('pages', many=True)}}}


@view_config(route_name='api.experiment.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def patch_item(request):
    body = validated_body(request, patch_experiment_schema)
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}
