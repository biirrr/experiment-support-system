from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_jinja2')
    config.commit()
    config.include('.tests')
    config.include('.util')
    config.include('.session')
    config.include('.permissions')
    config.include('.models')
    config.include('.routes')
    config.scan()
    return config.make_wsgi_app()
