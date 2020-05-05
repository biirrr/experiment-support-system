from pyramid.view import view_config

from ess.models.meta import Base


def init_db(request):
    Base.metadata.drop_all(request.dbsession.bind)
    Base.metadata.create_all(request.dbsession.bind)


@view_config(route_name='tests.create', renderer='json')
def create(request):
    """Handles the setup of test 1"""
    init_db(request)
    if 'object' in request.params:
        for obj in request.params.get_all('object'):
            pass
    return {}
