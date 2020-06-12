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
    config.add_route('experiment.results.download', '/experiments/:eid/results/download')

    config.add_route('api.internal', '/api/internal')
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
    config.add_route('api.result.item.get', '/api/experiments/:eid/results/:pid', request_method='GET')

    config.add_route('api.internal.question_type_group.collection.get',
                     '/api/internal/question-type-groups',
                     request_method='GET')
    config.add_route('api.internal.question_type_group.item.patch',
                     '/api/internal/question-type-groups/:qtgid',
                     request_method='PATCH')
    config.add_route('api.internal.question_type.item.get',
                     '/api/internal/question-types/:qtid',
                     request_method='GET')
    config.add_route('api.internal.question_type.item.patch',
                     '/api/internal/question-types/:qtid',
                     request_method='PATCH')

    config.add_route('experiment.run', '/run/:eid')
    config.add_route('experiment.run.api', '/run/api')
    config.add_route('experiment.run.api.experiment.item.get', '/run/api/experiments/:eid', request_method='GET')
    config.add_route('experiment.run.api.page.item.get', '/run/api/experiments/:eid/pages/:pid', request_method='GET')
    config.add_route('experiment.run.api.participant.collection.post', '/run/api/experiments/:eid/participants',
                     request_method='POST')
    config.add_route('experiment.run.api.participant.item.get', '/run/api/experiments/:eid/participants/:pid',
                     request_method='GET')
    config.add_route('experiment.run.api.transition.item.get', '/run/api/experiments/:eid/transitions/:tid',
                     request_method='GET')
    config.add_route('experiment.run.api.question.item.get', '/run/api/experiments/:eid/questions/:qid',
                     request_method='GET')
    config.add_route('experiment.run.validate', '/run/:eid/validate')
    config.add_route('experiment.run.submit', '/run/:eid/submit')

    config.add_route('admin', '/admin')
    config.add_route('admin.question_types', '/admin/question_types')

    # Jinja2 configuration
    config.include('pwh_pyramid_routes')
