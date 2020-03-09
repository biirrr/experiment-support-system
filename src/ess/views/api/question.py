from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Transition, Page
from ess.permissions import require_permission
from . import (validated_body, override_tree, type_schema, relationship_schema, store_object)


post_question_schema = {'type': type_schema('questions'),
                        'attributes': {'type': 'dict',
                                       'required': True,
                                       'schema': {}},
                        'relationships': {'type': 'dict',
                                          'schema': {'question-type': relationship_schema('question-types')}}}


@view_config(route_name='api.question.collection.post', renderer='json')
@require_permission('admin.experiments or @edit experiment :eid')
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
