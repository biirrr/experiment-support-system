from importlib.resources import open_binary
from pyramid.response import Response
from pyramid.view import view_config


@view_config(route_name='root', renderer='ess:templates/root.jinja2')
def root(request):
    return {}


@view_config(route_name="favicon")
def favicon_view(request):
    favicon = open_binary('ess.static', 'favicon.ico')
    return Response(body=favicon.read(),
                    headerlist=[
                        ('Content-type', 'image/x-icon')
                    ])
