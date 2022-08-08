from pyramid.httpexceptions import HTTPForbidden
from pyramid.view import notfound_view_config, exception_view_config


@notfound_view_config(renderer='ess:templates/error/404.jinja2')
def notfound_view(request):
    request.response.status = 404
    return {}


@exception_view_config(HTTPForbidden, renderer='ess:templates/error/403.jinja2')
def forbidden_view(request):
    request.response.status = 403
    return {}
