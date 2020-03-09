from pyramid.view import view_config
from sqlalchemy import and_

from ess.models import QuestionTypeGroup
from ess.session import require_logged_in


@view_config(route_name='api.question_type_group.collection.get', renderer='json')
@require_logged_in()
def get_collection(request):
    """Handles fetching all :class:`~ess.models.question_type_group.QuestionTypeGroup`."""
    return {'data': [qtg.as_jsonapi()
                     for qtg in request.dbsession.query(QuestionTypeGroup).
                     filter(QuestionTypeGroup.enabled == True).
                     order_by(QuestionTypeGroup.position)]}
