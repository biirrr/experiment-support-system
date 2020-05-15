def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('root', '/')

    config.add_route('user.register', '/users/register')
    config.add_route('user.confirm', '/users/confirm/:email/:token')
    config.add_route('user.login', '/users/login')
    config.add_route('user.logout', '/users/logout')
    config.add_route('user.forgotten_password', '/users/forgotten_password')
    config.add_route('user.view', '/users/:uid')
    config.add_route('user.experiments', '/users/:uid/experiments')

    config.add_route('experiment.create', '/experiments/create')
    config.add_route('experiment.edit', '/experiments/:eid/edit')

    config.add_route('api', '/api')
    config.add_route('api.experiment.item.get', '/api/experiments/:eid', request_method='GET')
    config.add_route('api.experiment.item.patch', '/api/experiments/:eid', request_method='PATCH')
    config.add_route('api.experiment.item.delete', '/api/experiments/:eid', request_method='DELETE')
    config.add_route('api.page.collection.post', '/api/experiments/:eid/pages', request_method='POST')
    config.add_route('api.page.item.get', '/api/experiments/:eid/pages/:pid', request_method='GET')
    config.add_route('api.page.item.patch', '/api/experiments/:eid/pages/:pid', request_method='PATCH')
    config.add_route('api.page.item.delete', '/api/experiments/:eid/pages/:pid', request_method='DELETE')
    config.add_route('api.transition.collection.post', '/api/experiments/:eid/transitions', request_method='POST')
    config.add_route('api.transition.item.get', '/api/experiments/:eid/transitions/:tid', request_method='GET')
    config.add_route('api.transition.item.patch', '/api/experiments/:eid/transitions/:tid', request_method='PATCH')
    config.add_route('api.transition.item.delete', '/api/experiments/:eid/transitions/:tid', request_method='DELETE')
    config.add_route('api.question.collection.post', '/api/experiments/:eid/pages/:pid/questions',
                     request_method='POST')
    config.add_route('api.question.item.get', '/api/experiments/:eid/pages/:pid/questions/:qid', request_method='GET')
    config.add_route('api.question.item.patch', '/api/experiments/:eid/pages/:pid/questions/:qid',
                     request_method='PATCH')
    config.add_route('api.question.item.delete', '/api/experiments/:eid/pages/:pid/questions/:qid',
                     request_method='DELETE')
    config.add_route('api.question_type_group.collection.get', '/api/question_type_groups', request_method='GET')
    config.add_route('api.question_type_group.item.patch', '/api/question_type_groups/:qtgid', request_method='PATCH')
    config.add_route('api.question_type.item.get', '/api/question_types/:qtid', request_method='GET')
    config.add_route('api.question_type.item.patch', '/api/question_types/:qtid', request_method='PATCH')
    config.add_route('api.question_type.item.delete', '/api/question_types/:qtid', request_method='DELETE')

    config.add_route('admin', '/admin')
    config.add_route('admin.question_types', '/admin/question_types')

    # Jinja2 configuration
    config.include('pwh_pyramid_routes')
