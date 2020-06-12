from pwh_permissions import permitted
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from pyramid.view import view_config

from ess.models import Experiment
from . import (validated_body, type_schema, id_schema, relationship_schema, store_object)


edit_experiment_schema = {'title': {'type': 'string', 'empty': False},
                          'description': {'type': 'string'}}


def check_permission(action, experiment, current_user):
    if not permitted(f'experiment allow current_user {action}', {'experiment': experiment,
                                                                 'current_user': current_user}):
        raise HTTPForbidden()


@view_config(route_name='api.internal.experiment.item.get', renderer='json')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.experiment.Experiment`."""
    if request.matched_route.name == 'api.external.experiment.item.get':
        experiment = request.dbsession.query(Experiment)\
            .filter(Experiment.external_id == request.matchdict['iid']).first()
        if experiment is not None:
            check_permission('participate', experiment, request.current_user)
            return {'data': experiment.as_jsonapi(external=True)}
    elif request.matched_route.name == 'api.internal.experiment.item.get':
        experiment = request.dbsession.query(Experiment)\
            .filter(Experiment.id == request.matchdict['iid']).first()
        if experiment is not None:
            check_permission('view', experiment, request.current_user)
            return {'data': experiment.as_jsonapi()}
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
                                                                            'paused', 'completed']},
                                                     '_stats': {'type': 'dict'}}},
                           'relationships': {'type': 'dict',
                                             'schema': {'first-page': relationship_schema('pages'),
                                                        'pages': relationship_schema('pages', many=True)}}}


@view_config(route_name='api.internal.experiment.item.patch', renderer='json')
def patch_item(request):
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['iid']).first()
    if experiment:
        check_permission('edit', experiment, request.current_user)
        body = validated_body(request, patch_experiment_schema)
        if '_stats' in body['data']['attributes']:
            del body['data']['attributes']['_stats']
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    raise HTTPNotFound()
