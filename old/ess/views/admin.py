from pwh_permissions.pyramid import require_permission
from pyramid.view import view_config


@view_config(route_name='admin', renderer='ess:templates/admin/index.jinja2')
@require_permission('$current_user has_permission admin.view')
def index(request):
    """Handles the admin landing page."""
    return {}


@view_config(route_name='admin.question_types', renderer='ess:templates/admin/question_types.jinja2')
@require_permission('$current_user has_permission admin.question_types')
def question_types(request):
    """Handles the questions admin main page."""
    return {}
