import click
import transaction

from hashlib import sha512

from ..models import get_engine, get_session_factory, get_tm_session, Setting, User


def allow_admin(dbsession, email, password):
    """Check whether the User with the given email and password is allowed to admin the settings."""
    user = dbsession.query(User).filter(User.email == email).first()
    if user:
        hash = sha512()
        hash.update(user.salt.encode('utf-8'))
        hash.update(b'$$')
        hash.update(password.encode('utf-8'))
        if user.password == hash.hexdigest() and user.has_permission('admin.settings'):
            return True
    return False


@click.command()
@click.pass_context
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
def list_settings(ctx, email, password):
    """List all settings"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        if allow_admin(dbsession, email, password):
            for setting in dbsession.query(Setting).order_by(Setting.key):
                click.echo(f'{setting.key}: {setting.value}')
        else:
            click.echo(click.style('You are not authorised to access this area', fg='red'))


@click.command()
@click.pass_context
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
@click.argument('key')
@click.argument('value')
def set_setting(ctx, email, password, key, value):
    """Set th setting with the given KEY to the given VALUE"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        if allow_admin(dbsession, email, password):
            setting = dbsession.query(Setting).filter(Setting.key == key).first()
            if setting:
                if not setting.values or value in setting.values:
                    setting.value = value
                else:
                    click.echo(click.style(f'{value} is not an allowed value for {key}. Must be one of:', fg='red'))
                    click.echo(', '.join(setting.values))
            else:
                dbsession.add(Setting(key=key, value=value, values=[], guidance=''))
        else:
            click.echo(click.style('You are not authorised to access this area', fg='red'))
