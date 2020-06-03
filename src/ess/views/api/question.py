from copy import deepcopy
from pwh_permissions import permitted
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPNoContent, HTTPForbidden
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Question, Page, Experiment
from . import (validated_body, type_schema, relationship_schema, id_schema, store_object)


post_question_schema = {'type': type_schema('questions'),
                        'attributes': {'type': 'dict',
                                       'required': True,
                                       'schema': {}},
                        'relationships': {'type': 'dict',
                                          'schema': {'question-type': relationship_schema('question-types')}}}


@view_config(route_name='api.question.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def post_collection(request):
    """Handles fetching a single :class:`~ess.models.page.Page`."""
    body = validated_body(request, post_question_schema)
    body['data']['relationships']['page'] = {
        'data': {
            'type': 'pages',
            'id': request.matchdict['pid'],
        }
    }
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.question.item.get', renderer='json')
@view_config(route_name='experiment.run.api.question.item.get', renderer='json')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.question.Question`."""
    if request.matched_route.name == 'experiment.run.api.question.item.get':
        item = request.dbsession.query(Question)\
            .join(Page)\
            .join(Page.experiment)\
            .filter(and_(Question.id == request.matchdict['qid'],
                         Page.id == request.matchdict['pid'],
                         Experiment.external_id == request.matchdict['eid'])).first()
        if item is not None:
            if permitted('question allow current_user participate', {'question': item,
                                                                     'current_user': request.current_user}):
                return {'data': item.as_jsonapi()}
            else:
                raise HTTPForbidden()
        else:
            raise HTTPNotFound()
    elif request.matched_route.name == 'api.question.item.get':
        item = request.dbsession.query(Question)\
            .join(Page)\
            .filter(and_(Question.id == request.matchdict['qid'],
                         Page.id == request.matchdict['pid'],
                         Page.experiment_id == request.matchdict['eid'])).first()
        if item is not None:
            if permitted('question allow current_user edit', {'question': item,
                                                              'current_user': request.current_user}):
                return {'data': item.as_jsonapi()}
            else:
                raise HTTPForbidden()
        else:
            raise HTTPNotFound()


patch_question_schema = {'type': type_schema('questions'),
                         'attributes': {'type': 'dict',
                                        'required': True,
                                        'schema': {}},
                         'relationships': {'type': 'dict',
                                           'required': True,
                                           'schema': {}}}


@view_config(route_name='api.question.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def patch_item(request):
    """Handles updating a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question).join(Page).\
        filter(and_(Question.id == request.matchdict['qid'],
                    Page.id == request.matchdict['pid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        schema = deepcopy(patch_question_schema)
        schema['relationships']['schema']['page'] = relationship_schema('pages', fixed_value=str(item.page.id))
        schema['relationships']['schema']['question-type'] = \
            relationship_schema('question-types',
                                fixed_value=str(item.question_type.id))
        schema['id'] = id_schema(str(item.id))
        for key, value in item.question_type.inherited_attributes().items():
            if isinstance(value, dict) and value['source'] == 'user':
                if value['type'] == 'singleValue' or value['type'] == 'multiLineTextValue':
                    schema['attributes']['schema'][key] = {'type': 'string',
                                                           'required': True}
                elif value['type'] == 'booleanValue':
                    schema['attributes']['schema'][key] = {'type': 'boolean',
                                                           'required': True}
                elif value['type'] == 'listOfValues':
                    schema['attributes']['schema'][key] = {'type': 'list',
                                                           'schema': {'type': 'string'}}
        body = validated_body(request, schema)
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    else:
        raise HTTPNotFound()


@view_config(route_name='api.question.item.delete', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def delete_item(request):
    """Handles deleting a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question).join(Page).\
        filter(and_(Question.id == request.matchdict['qid'],
                    Page.id == request.matchdict['pid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        request.dbsession.delete(item)
        return HTTPNoContent()
    else:
        raise HTTPNotFound()
