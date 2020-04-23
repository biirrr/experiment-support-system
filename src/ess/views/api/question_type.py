from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from ess.models import QuestionType
from pwh_pyramid_session import require_logged_in


@view_config(route_name='api.question_type.item.get', renderer='json')
@require_logged_in()
def get_item(request):
    """Handles fetching a single :class:`~ess.models.experiment.Experiment`."""
    item = request.dbsession.query(QuestionType).filter(QuestionType.id == request.matchdict['qtid']).first()
    if item is not None:
        return {'data': item.as_jsonapi()}
    else:
        raise HTTPNotFound()
