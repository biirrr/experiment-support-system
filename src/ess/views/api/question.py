from copy import deepcopy
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPNoContent
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Question, Page
from . import (validated_body, type_schema, relationship_schema, id_schema, store_object)


post_question_schema = {'type': type_schema('questions'),
                        'attributes': {'type': 'dict',
                                       'required': True,
                                       'schema': {}},
                        'relationships': {'type': 'dict',
                                          'schema': {'question-type': relationship_schema('question-types'),
                                                     'page': relationship_schema('pages')}}}


@view_config(route_name='api.backend.question.collection.post', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_post_collection(request):
    """Handles creating a new :class:`~ess.models.question.Question`."""
    body = validated_body(request, post_question_schema)
    obj = store_object(request, body)
    return {'data': obj.as_jsonapi()}


@view_config(route_name='api.backend.question.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_item(request):
    """Handles fetching a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question)\
        .join(Page)\
        .filter(and_(Question.id == request.matchdict['iid'],
                     Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


patch_question_schema = {'type': type_schema('questions'),
                         'attributes': {'type': 'dict',
                                        'required': True,
                                        'schema': {}},
                         'relationships': {'type': 'dict',
                                           'required': True,
                                           'schema': {}}}


@view_config(route_name='api.backend.question.item.patch', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_patch_item(request):
    """Handles updating a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question).join(Page).\
        filter(and_(Question.id == request.matchdict['iid'],
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
                elif value['type'] == 'essQuestionCondition':
                    schema['attributes']['schema'][key] = {'type': 'dict',
                                                           'schema': {'question': {'type': 'string',
                                                                                   'required': True},
                                                                      'subQuestion': {'type': 'string'},
                                                                      'operator': {'type': 'string',
                                                                                   'allowed': ['eq', 'neq']},
                                                                      'value': {'type': 'string'}},
                                                           'required': False}
        body = validated_body(request, schema)
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    else:
        raise HTTPNotFound()


@view_config(route_name='api.backend.question.item.delete', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_delete_item(request):
    """Handles deleting a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question).join(Page).\
        filter(and_(Question.id == request.matchdict['iid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        request.dbsession.delete(item)
        return HTTPNoContent()
    else:
        raise HTTPNotFound()
