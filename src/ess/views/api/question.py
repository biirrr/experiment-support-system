from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import Question, Page
from ess.permissions import require_permission
from . import (validated_body, type_schema, relationship_schema, store_object)


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
@require_permission('Experiment:eid allow $current_user edit')
def get_item(request):
    """Handles fetching a single :class:`~ess.models.question.Question`."""
    item = request.dbsession.query(Question).join(Page).\
        filter(and_(Question.id == request.matchdict['qid'],
                    Page.id == request.matchdict['pid'],
                    Page.experiment_id == request.matchdict['eid'])).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()
