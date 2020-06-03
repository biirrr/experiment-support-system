from collections import OrderedDict
from copy import deepcopy
from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound, HTTPNoContent, HTTPClientError
from pyramid.view import view_config

from ess.models import QuestionType, Question
from ess.util import Validator

from . import type_schema, id_schema, relationship_schema, links_schema, validated_body, store_object


class InvalidQuestionType(Exception):

    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg


question_type_import_schema = {'type': type_schema('questions'),
                               'id': id_schema(),
                               'links': links_schema(),
                               'attributes': {'type': 'dict',
                                              'required': True,
                                              'keysrules': {'type': 'string', 'regex': '[_\\-a-z]+'}},
                               'relationships': {'type': 'dict',
                                                 'schema': {'parent': relationship_schema('questions')}}}


def import_question_type(data, dbsession):
    """Import one or more question types from the USEF representation, returning the existing or newly created
    :class:`~ess.models.question_type.QuestionType` objects."""
    # Check that the data is valid and collect all questions to import
    if 'data' not in data:
        raise InvalidQuestionType('The data to import must contain a data key')
    questions = OrderedDict()
    if isinstance(data['data'], dict):
        questions[data['data']['id']] = data['data']
    elif isinstance(data['data'], list):
        for item in data['data']:
            questions[item['id']] = item
    else:
        raise InvalidQuestionType('The data key must either be a dict or a list')
    if 'included' in data and isinstance(data['included'], list):
        for item in data['included']:
            questions[item['id']] = item
    for question in questions.values():
        validator = Validator(question_type_import_schema, request=None)
        if not validator.validate(question):
            raise InvalidQuestionType(str(validator.errors))
    # Import question types
    db_questions = {}
    for question in questions.values():
        question_type = dbsession.query(QuestionType).filter(QuestionType.source == question['links']['self']).first()
        if not question_type:
            question_type = QuestionType(name=question['id'], source=question['links']['self'])
            question_type.attributes = question['attributes']
            dbsession.add(question_type)
        db_questions[question['id']] = question_type
    # Add the parent links
    for question in questions.values():
        if 'relationships' in question and 'parent' in question['relationships']:
            if question['relationships']['parent']['data']['id'] in db_questions:
                db_questions[question['id']].parent = db_questions[question['relationships']['parent']['data']['id']]
            else:
                raise InvalidQuestionType(f"Parent relationship pointing to unknown question " +
                                          "{question['relationships']['parent']['data']['id']}")
    # Return those question types that were in the data key
    if isinstance(data['data'], dict):
        return dbsession.query(QuestionType).filter(QuestionType.source == data['data']['links']['self']).first()
    elif isinstance(data['data'], list):
        return dbsession.query(QuestionType).filter(QuestionType.source.in_([question['links']['self']
                                                                             for question in data['data']]))


@view_config(route_name='api.question_type.item.get', renderer='json')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.question_type.QuestionType`."""
    item = request.dbsession.query(QuestionType).filter(QuestionType.id == request.matchdict['qtid']).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()


patch_question_type_schema = {'type': type_schema('question-types'),
                              'attributes': {'type': 'dict',
                                             'required': True,
                                             'keysrules': {'type': 'string', 'regex': '[_\\-a-z]+'}},
                              'relationships': {'type': 'dict',
                                                'required': True,
                                                'schema': {'question-type-group':
                                                           relationship_schema('question-type-groups',
                                                                               required=True),
                                                           'parent':
                                                           relationship_schema('question-types')}}}


@view_config(route_name='api.question_type.item.patch', renderer='json')
@require_permission('$current_user has_permission admin.question_types')
def patch_item(request):
    """Handles updating a single :class:`~ess.models.question_type.QuestionType`."""
    item = request.dbsession.query(QuestionType).filter(QuestionType.id == request.matchdict['qtid']).first()
    if item is not None:
        schema = deepcopy(patch_question_type_schema)
        schema['id'] = id_schema(fixed_value=request.matchdict['qtid'])
        body = validated_body(request, schema)
        enabled = True
        if '_enabled' in body['data']['attributes']:
            enabled = body['data']['attributes']['_enabled']
            del body['data']['attributes']['_enabled']
        if '_position' in body['data']['attributes']:
            del body['data']['attributes']['_position']
        obj = store_object(request, body, overrides={'enabled': enabled})
        return {'data': obj.as_jsonapi()}
    else:
        raise HTTPNotFound()


def get_subtree_ids(questionType):
    """Returns the list of all ids of the `questionType` and of its descendants."""
    result = [questionType.id]
    for child in questionType.children:
        result.extend(get_subtree_ids(child))
    return result


@view_config(route_name='api.question_type.item.delete', renderer='json')
@require_permission('$current_user has_permission admin.question_types')
def delete_item(request):
    """Handles deleting a single :class:`~ess.models.question_type.QuestionType`."""
    item = request.dbsession.query(QuestionType).filter(QuestionType.id == request.matchdict['qtid']).first()
    if item is not None:
        id_list = get_subtree_ids(item)
        if request.dbsession.query(Question).filter(Question.question_type_id.in_(id_list)).count() > 0:
            raise HTTPClientError()
        else:
            request.dbsession.delete(item)
            return HTTPNoContent()
    else:
        raise HTTPNotFound()
