from pyramid.response import Response
from pyramid.view import view_config

from sqlalchemy.exc import DBAPIError

@view_config(route_name='root', renderer='ess:templates/root.jinja2')
def root(request):
    return {}
