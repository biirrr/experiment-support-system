from copy import deepcopy
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from ess.models import QuestionTypeGroup
from pwh_permissions.pyramid import require_permission

from . import type_schema, id_schema, relationship_schema, validated_body, store_object


@view_config(route_name='api.internal.question_type_group.collection.get', renderer='json')
def get_collection(request):
    """Handles fetching all :class:`~ess.models.question_type_group.QuestionTypeGroup`."""
    return {'data': [qtg.as_jsonapi()
                     for qtg in request.dbsession.query(QuestionTypeGroup).
                     order_by(QuestionTypeGroup.position)]}


patch_question_type_group_schema = {'type': type_schema('question-type-groups'),
                                    'attributes': {'type': 'dict',
                                                   'required': True,
                                                   'schema': {'title': {'type': 'string', 'required': True},
                                                              'enabled': {'type': 'boolean', 'required': True},
                                                              'position': {'type': 'number', 'required': True}}},
                                    'relationships': {'type': 'dict',
                                                      'required': True,
                                                      'schema': {'question-types':
                                                                 relationship_schema('question-types',
                                                                                     required=True,
                                                                                     many=True)}}}


@view_config(route_name='api.internal.question_type_group.item.patch', renderer='json')
@require_permission('$current_user has_permission admin.question_types')
def patch_item(request):
    """Handles updating a single :class:`~ess.models.question_type_group.QuestionTypeGroup`."""
    item = request.dbsession.query(QuestionTypeGroup).filter(QuestionTypeGroup.id == request.matchdict['iid']).first()
    if item is not None:
        schema = deepcopy(patch_question_type_group_schema)
        schema['id'] = id_schema(fixed_value=request.matchdict['iid'])
        body = validated_body(request, schema)
        obj = store_object(request, body)
        return {'data': obj.as_jsonapi()}
    else:
        raise HTTPNotFound()
