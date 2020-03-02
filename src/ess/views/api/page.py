from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from ess.models import Page
from ess.permissions import require_permission


edit_experiment_schema = {'title': {'type': 'string', 'empty': False},
                          'description': {'type': 'string'}}


@view_config(route_name='api.page.item.get', renderer='json')
@require_permission('admin.experiments or @edit page :id')
def get_item(request):
    """Handles the creation of a new experiment."""
    page = request.dbsession.query(Page).filter(Page.id == request.matchdict['id']).first()
    if page is not None:
        return {'data': page.as_jsonapi()}
    else:
        raise HTTPNotFound()
