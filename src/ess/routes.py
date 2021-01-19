def generate_api_routes(config, base_type, data_type, url_prefix=''):
    config.add_route(f'api.{base_type}.{data_type.replace("-", "_")[:-1]}.collection.get',
                     f'/api/{base_type}{url_prefix}/{data_type}',
                     request_method='GET')
    config.add_route(f'api.{base_type}.{data_type.replace("-", "_")[:-1]}.collection.post',
                     f'/api/{base_type}{url_prefix}/{data_type}',
                     request_method='POST')
    config.add_route(f'api.{base_type}.{data_type.replace("-", "_")[:-1]}.item.get',
                     f'/api/{base_type}{url_prefix}/{data_type}/:iid',
                     request_method='GET')
    config.add_route(f'api.{base_type}.{data_type.replace("-", "_")[:-1]}.item.patch',
                     f'/api/{base_type}{url_prefix}/{data_type}/:iid',
                     request_method='PATCH')
    config.add_route(f'api.{base_type}.{data_type.replace("-", "_")[:-1]}.item.delete',
                     f'/api/{base_type}{url_prefix}/{data_type}/:iid',
                     request_method='DELETE')


def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('root', '/')
    config.add_route("favicon", "/favicon.ico")

    config.add_route('user.register', '/users/register')
    config.add_route('user.confirm', '/users/confirm/:email/:token')
    config.add_route('user.login', '/users/login')
    config.add_route('user.logout', '/users/logout')
    config.add_route('user.forgotten_password', '/users/forgotten_password')
    config.add_route('user.view', '/users/:uid')
    config.add_route('user.experiments', '/users/:uid/experiments')

    config.add_route('experiment.create', '/experiments/create')
    config.add_route('experiment.edit', '/experiments/:eid/edit')
    config.add_route('experiment.results.download', '/experiments/:eid/results/download')
    config.add_route('experiment.run', '/run/:eid')
    config.add_route('experiment.run.validate', '/run/:eid/validate')
    config.add_route('experiment.run.submit', '/run/:eid/submit')

    config.add_route('api.admin', '/api/admin')
    generate_api_routes(config, 'admin', 'question-types')
    generate_api_routes(config, 'admin', 'question-type-groups')
    config.add_route('api.backend', '/api/backend/:eid')
    generate_api_routes(config, 'backend', 'users', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'question-types', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'question-type-groups', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'experiments', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'experiment-permissions', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'pages', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'transitions', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'questions', url_prefix='/:eid')
    generate_api_routes(config, 'backend', 'results', url_prefix='/:eid')
    config.add_route('api.external', '/api/external/:eid')
    generate_api_routes(config, 'external', 'question-types', url_prefix='/:eid')
    generate_api_routes(config, 'external', 'experiments', url_prefix='/:eid')
    generate_api_routes(config, 'external', 'pages', url_prefix='/:eid')
    generate_api_routes(config, 'external', 'transitions', url_prefix='/:eid')
    generate_api_routes(config, 'external', 'questions', url_prefix='/:eid')
    generate_api_routes(config, 'external', 'participants', url_prefix='/:eid')

    config.add_route('admin', '/admin')
    config.add_route('admin.question_types', '/admin/question_types')

    # Jinja2 configuration
    config.include('pwh_pyramid_routes')
