from .models import User


def includeme(config):
    """Setup the session handling in the configuration."""
    config.add_settings({'pwh.pyramid_session.user': User,
                         'pwh.pyramid_session.login_route': 'user.login',
                         'pwh.pyramid_session.cookie_name': 'toja',
                         'pwh.pyramid_session.timeout': 86400})
    config.include('pwh_pyramid_session')
