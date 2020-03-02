from pyramid.view import view_config


@view_config(route_name='root', renderer='ess:templates/root.jinja2')
def root(request):
    return {}
