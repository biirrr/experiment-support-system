from .models import User, Experiment, Page


def map_class(class_name):
    """Returns the class for the ``class_name``."""
    if class_name == 'User':
        return User
    elif class_name == 'Experiment':
        return Experiment
    elif class_name == 'Page':
        return Page


def includeme(config):
    """Inject the filters into the configuration."""
    config.add_settings({'pwh.permissions.class_mapper': map_class,
                         'pwh.permissions.login_route': 'user.login'})
    config.include('pwh_permissions.pyramid')
