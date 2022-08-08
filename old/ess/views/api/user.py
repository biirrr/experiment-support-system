from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from ess.models import User


@view_config(route_name='api.backend.user.collection.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_collection(request):
    """Handles fetching up to 10 :class:`~ess.models.user.User`."""
    users = request.dbsession.query(User)
    if 'filter[email]' in request.params:
        users = users.filter(User.email.contains(request.params['filter[email]']))
    users = users.limit(10)
    return {'data': [user.as_jsonapi() for user in users]}


@view_config(route_name='api.backend.user.item.get', renderer='json')
@require_permission('Experiment:eid allow $current_user edit')
def backend_get_item(request):
    """Handles fetching a single :class:`~ess.models.user.User`."""
    user = request.dbsession.query(User)\
        .filter(User.id == request.matchdict['iid']).first()
    if user is not None:
        return {'data': user.as_jsonapi()}
    raise HTTPNotFound()
