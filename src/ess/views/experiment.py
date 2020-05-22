import json

from pwh_permissions.pyramid import require_permission
from pyramid.httpexceptions import HTTPFound, HTTPNotFound, HTTPNoContent, HTTPBadRequest
from pyramid.view import view_config
from secrets import token_hex
from sqlalchemy import and_

from ..models import Experiment, ExperimentPermission, Page, Participant
from ..util import Validator
from .api import flatten_errors


create_experiment_schema = {'title': {'type': 'string', 'empty': False},
                            'description': {'type': 'string'},
                            'csrf_token': {'type': 'string', 'empty': False}}


@view_config(route_name='experiment.create', renderer='ess:templates/experiment/create.jinja2')
@require_permission('$current_user has_permission experiment.create')
def create(request):
    """Handles the creation of a new experiment."""
    if request.method == 'POST':
        validator = Validator(create_experiment_schema)
        if validator.validate(request.params):
            external_id = token_hex(32)
            while request.dbsession.query(Experiment).filter(Experiment.external_id == external_id).first():
                external_id = token_hex(32)
            experiment = Experiment(external_id=external_id,
                                    attributes={'title': request.params['title'],
                                                'description': request.params['description'],
                                                'status': 'development'})
            permission = ExperimentPermission(user=request.current_user,
                                              experiment=experiment,
                                              role='owner')
            request.dbsession.add(experiment)
            request.dbsession.add(permission)
            request.dbsession.flush()
            return HTTPFound(request.route_url('experiment.edit', eid=experiment.id))
        else:
            return {'errors': validator.errors, 'values': request.params}
    return {}


@view_config(route_name='experiment.edit', renderer='ess:templates/experiment/edit.jinja2')
@require_permission('Experiment:eid allow $current_user edit')
def edit(request):
    """Handles the creation of a new experiment."""
    experiment = request.dbsession.query(Experiment).filter(Experiment.id == request.matchdict['eid']).first()
    if experiment:
        return {'experiment': experiment}
    else:
        raise HTTPNotFound()


@view_config(route_name='experiment.run', renderer='ess:templates/experiment/run.jinja2')
def run(request):
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment:
        return {'experiment': experiment}
    else:
        raise HTTPNotFound()


def schema_value(attr, question_type, question):
    if attr not in question_type:
        return None
    definition = question_type[attr]
    if isinstance(definition, dict):
        if 'source' in definition and definition['source'] == 'user':
            return question[attr]
        raise Exception()  # TODO: Needs a proper exception type
    else:
        return definition


def schema_for_page(page):
    schema = {}
    for question in page.questions:
        attributes = question.question_type.inherited_attributes()
        if attributes['_core_type'] == 'USEFSingleLineInput':
            schema[str(question.id)] = {'type': 'string',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes)}
        elif attributes['_core_type'] == 'USEFMultiLineInput':
            schema[str(question.id)] = {'type': 'string',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes)}
        elif attributes['_core_type'] == 'USEFSingleChoice':
            schema[str(question.id)] = {'type': 'string',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes),
                                        'allowed': schema_value('values',
                                                                attributes,
                                                                question.attributes)}
        elif attributes['_core_type'] == 'USEFMultiChoice':
            schema[str(question.id)] = {'type': 'list',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes),
                                        'allowed': schema_value('values',
                                                                attributes,
                                                                question.attributes)}
        elif attributes['_core_type'] == 'USEFHidden':
            schema[str(question.id)] = {'type': 'string',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes)}
        elif attributes['_core_type'] == 'USEFSingleChoiceGrid':
            row_schema = {}
            for value in schema_value('row_values', attributes, question.attributes):
                row_schema[value] = {'type': 'string',
                                     'required': schema_value('required',
                                                              attributes,
                                                              question.attributes),
                                     'empty': not schema_value('required',
                                                               attributes,
                                                               question.attributes),
                                     'allowed': schema_value('column_values',
                                                             attributes,
                                                             question.attributes)}
            schema[str(question.id)] = {'type': 'dict',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes),
                                        'schema': row_schema}
        elif attributes['_core_type'] == 'USEFMultiChoiceGrid':
            row_schema = {}
            for value in schema_value('row_values', attributes, question.attributes):
                row_schema[value] = {'type': 'list',
                                     'required': schema_value('required',
                                                              attributes,
                                                              question.attributes),
                                     'empty': not schema_value('required',
                                                               attributes,
                                                               question.attributes),
                                     'allowed': schema_value('column_values',
                                                             attributes,
                                                             question.attributes)}
            schema[str(question.id)] = {'type': 'dict',
                                        'required': schema_value('required',
                                                                 attributes,
                                                                 question.attributes),
                                        'empty': not schema_value('required',
                                                                  attributes,
                                                                  question.attributes),
                                        'schema': row_schema}
    return schema


@view_config(route_name='experiment.run.validate', renderer='json')
def validate(request):
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment:
        try:
            body = json.loads(request.body)
            if 'page' in body:
                page = request.dbsession.query(Page).filter(and_(Page.id == body['page'],
                                                                 Page.experiment_id == experiment.id)).\
                    first()
                if page:
                    validator = Validator(schema_for_page(page))
                    if validator.validate(body['responses']):
                        return HTTPNoContent()
                    else:
                        raise HTTPBadRequest(body=json.dumps({'errors': flatten_errors(validator.errors)}))
                else:
                    raise HTTPNotFound()
            else:
                raise HTTPBadRequest(body=json.dumps({'errors': [{'title': 'Invalid JSON body'}]}))
        except json.JSONDecodeError:
            raise HTTPBadRequest(body=json.dumps({'errors': [{'title': 'Invalid JSON body'}]}))
    else:
        raise HTTPNotFound()


def schema_for_experiment(page, schema):
    if page.id not in schema:
        schema[str(page.id)] = {'type': 'dict', 'required': True, 'schema': schema_for_page(page)}
        for transition in page.next:
            if transition.target:
                schema = schema_for_experiment(transition.target, schema)
    return schema


@view_config(route_name='experiment.run.submit', renderer='ess:templates/experiment/run.jinja2')
def submit(request):
    experiment = request.dbsession.query(Experiment).filter(Experiment.external_id == request.matchdict['eid']).first()
    if experiment and experiment.first_page:
        try:
            body = json.loads(request.body)
            schema = {'participant': {'type': 'string',
                                      'required': True,
                                      'empty': False},
                      'responses': {'type': 'dict',
                                    'required': True,
                                    'empty': False,
                                    'schema': schema_for_experiment(experiment.first_page, {})}}
            validator = Validator(schema)
            if validator.validate(body):
                participant = request.dbsession.query(Participant).\
                    filter(and_(Participant.external_id == body['participant'],
                                Participant.experiment_id == experiment.id)).\
                    first()
                if participant:
                    participant.responses = body['responses']
                    request.dbsession.add(participant)
                    return HTTPNoContent()
                else:
                    raise HTTPNotFound()
            else:
                raise HTTPBadRequest(body=json.dumps({'errors': flatten_errors(validator.errors)}))
        except json.JSONDecodeError:
            raise HTTPBadRequest(body=json.dumps({'errors': [{'title': 'Invalid JSON body'}]}))
    else:
        raise HTTPNotFound()
