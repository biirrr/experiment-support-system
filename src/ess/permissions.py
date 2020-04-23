from decorator import decorator
from functools import lru_cache
from pyramid.httpexceptions import HTTPForbidden, HTTPFound
from pwh_permissions import parse, tokenise, evaluate
from re import compile

from .models import User, Experiment, Page
from .routes import encode_route


def map_class(class_name):
    """Returns the class for the ``class_name``."""
    if class_name == 'User':
        return User
    elif class_name == 'Experiment':
        return Experiment
    elif class_name == 'Page':
        return Page


OBJ_PATTERN = compile('^([A-Za-z]+):([A-Za-z]+)')


@lru_cache()
def process_permission(permission):
    """Process the ``permission``, return the instructions and substitution values."""
    instructions = parse(tokenise(permission))
    values = {}
    for instruction in instructions:
        if isinstance(instruction, tuple):
            for part in instruction:
                match = OBJ_PATTERN.match(part)
                if match:
                    values[part] = (map_class(match.group(1)), match.group(2))
                elif part == '$current_user':
                    values[part] = 'current_user'
    return instructions, values


def check_permission(request, instructions, base_values):
    """Checks the permission ``instructions``, substituting the ``base_values`` with data taken from the
    ``request``."""
    values = {}
    for key, value in base_values.items():
        if isinstance(value, tuple):
            values[key] = request.dbsession.query(value[0]).filter(value[0].id == request.matchdict[value[1]]).first()
        elif value == 'current_user':
            values[key] = request.current_user
    return evaluate(instructions, values)


def permitted(request, permission):
    """Jinja2 filter that checks if the current user has a specific permission."""
    return check_permission(request, *process_permission(permission))


def require_permission(permission):
    """Pyramid decorator to check permissions for a request."""
    instructions, values = process_permission(permission)

    def handler(f, *args, **kwargs):
        request = args[0]
        if check_permission(request, instructions, values):
            return f(*args, **kwargs)
        elif request.current_user:
            raise HTTPForbidden()
        else:
            raise HTTPFound(request.route_url('user.login', _query={'redirect': encode_route(request)}))
    return decorator(handler)


def includeme(config):
    """Inject the filters into the configuration."""
    config.get_jinja2_environment().filters['permitted'] = permitted
