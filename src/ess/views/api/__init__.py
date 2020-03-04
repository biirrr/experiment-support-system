import json

from copy import deepcopy
from decorator import decorator
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest

from ess.util import Validator
from ess.models import Experiment, Page


COLLECTION_POST_SCHEMA = {'data': {'type': 'dict', 'schema': None}}


def flatten_errors(errors, path=''):
    """Flatten Cerberus errors into the JSONAPI structure."""
    flat_errors = []
    for key, values in errors.items():
        for value in values:
            if isinstance(value, dict):
                flat_errors.extend(flatten_errors(value, path='{0}/{1}'.format(path, key)))
            else:
                flat_errors.append({'title': '{0}{1}'.format(value[0].title(), value[1:]),
                                    'source': {'pointer': '{0}/{1}'.format(path, key)}})
    return flat_errors


def parse_body(request):
    """Parse the JSON body data."""
    try:
        return json.loads(request.body)
    except:
        raise HTTPBadRequest()


def validated_body(request, schema):
    """Return the validated body, validated according to the ``schema``."""
    body = parse_body(request)
    validation_schema = deepcopy(COLLECTION_POST_SCHEMA)
    validation_schema['data']['schema'] = schema
    validator = Validator(validation_schema)
    if validator.validate(body):
        return validator.validated(body)
    else:
        raise HTTPBadRequest(body=json.dumps({'errors': flatten_errors(validator.errors)}))


def set_value(obj, path, value):
    """Set the ``value`` in the ``obj`` at the location ``path``."""
    if len(path) == 1:
        obj[path[0]] = value
    else:
        if path[0] in obj:
            set_value(obj[path[0]], path[1:], value)
        else:
            obj[path[0]] = {}
            set_value(obj[path[0]], path[1:], value)


def override_tree(base, overrides):
    """Override specific elements in the ``base`` tree."""
    for path, value in overrides.items():
        set_value(base, path.split('.'), value)
    return base


def type_schema(type_name):
    """Return a Cerberus schema for the given ``type_name``."""
    return {'type': 'string',
            'required': True,
            'allowed': [type_name],
            'empty': False}


def id_schema():
    """Return a Cerberus schema for an id attribute."""
    return {'type': 'string',
            'required': True,
            'empty': False}


def reference_schema(type_name):
    """Return a Cerberus schema for a reference to an object of type ``type_name``."""
    return {'type': type_schema(type_name),
            'id': id_schema()}


def relationship_schema(type_name, required=False, many=False):
    """Return a Cerberus schema for a relationship structure."""
    if many:
        return {'type': 'dict',
                'required': required,
                'schema': {'data': {'type': 'list',
                                    'schema': {'type': 'dict',
                                               'schema': reference_schema(type_name)}}}}
    else:
        return {'type': 'dict',
                'required': required,
                'schema': {'data': {'type': 'dict',
                                    'required': True,
                                    'schema': reference_schema(type_name)}}}


def class_for_type(data):
    """Return the model class for the given ``data`` object."""
    cls = None
    if data['type'] == 'experiments':
        cls = Experiment
    elif data['type'] == 'pages':
        cls = Page
    return cls


def find_object(request, data):
    """Find the database object for the given data."""
    cls = class_for_type(data)
    if cls is not None:
        return request.dbsession.query(cls).filter(cls.id == data['id']).first()
    else:
        return None


def store_object(request, data, valid_target=None):
    """Store the given JSONAPI ``data`` object in the database."""
    if 'id' in data:
        obj = find_object(request, data)
        if obj is None:
            raise HTTPNotFound()
    else:
        obj = class_for_type(data['data'])()
    if 'attributes' in data['data']:
        obj.attributes = data['data']['attributes']
    if 'relationships' in data['data']:
        for key, relationship_data in data['data']['relationships'].items():
            if isinstance(relationship_data['data'], list):
                targets = []
                for value in relationship_data['data']:
                    target = find_object(request, value)
                    if valid_target is None or valid_target(key, target):
                        targets.push(target)
                setattr(obj, key.replace('-', '_'), targets)
            elif isinstance(relationship_data['data'], dict):
                target = find_object(request, relationship_data['data'])
                if valid_target is None or valid_target(key, target):
                    setattr(obj, key.replace('-', '_'), target)
    request.dbsession.add(obj)
    request.dbsession.flush()
    return obj
