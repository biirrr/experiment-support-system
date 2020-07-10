from pwh_permissions import permitted
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPForbidden
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Experiment
from . import (validated_body, type_schema, id_schema, relationship_schema, store_object)


edit_experiment_schema = {'title': {'type': 'string', 'empty': False},
                          'description': {'type': 'string'}}


def check_permission(action, experiment, current_user):
    if not permitted(f'experiment allow current_user {action}', {'experiment': experiment,
                                                                 'current_user': current_user}):
        raise HTTPForbidden()


@view_config(route_name='api.backend.experiment.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_item(request):
    """Handles fetching a single :class:`~ess.models.experiment.Experiment`."""
    experiment = request.dbsession.query(Experiment)\
        .filter(and_(Experiment.id == request.matchdict['eid'],
                     Experiment.id == request.matchdict['iid'])).first()
    if experiment is not None:
        return {'data': experiment.as_jsonapi()}
    raise HTTPNotFound()


@view_config(route_name='api.external.experiment.item.get', renderer='json')
@require_permission('Experiment:external_id:eid allow $current_user participate')
def external_get_item(request):
    experiment = request.dbsession.query(Experiment)\
        .filter(and_(Experiment.external_id == request.matchdict['eid'],
                     Experiment.external_id == request.matchdict['iid'])).first()
    if experiment is not None:
        return {'data': experiment.as_jsonapi(external=True)}
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


@view_config(route_name='api.backend.experiment.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_patch_item(request):
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['iid']).first()
    if experiment:
        check_permission('edit', experiment, request.current_user)
        body = validated_body(request, patch_experiment_schema)
        if '_stats' in body['data']['attributes']:
            del body['data']['attributes']['_stats']
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    raise HTTPNotFound()
