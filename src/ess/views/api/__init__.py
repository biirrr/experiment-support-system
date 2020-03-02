def generate_api_routes(config, name, fragment):
    config.add_route('api.{0}.collection.post'.format(name), '/api/{0}'.format(fragment), request_method='POST')
    config.add_route('api.{0}.item.get'.format(name), '/api/{0}/:id'.format(fragment), request_method='GET')
    config.add_route('api.{0}.item.patch'.format(name), '/api/{0}/:id'.format(fragment), request_method='PATCH')
    config.add_route('api.{0}.item.delete'.format(name), '/api/{0}/:id'.format(fragment), request_method='DELETE')
