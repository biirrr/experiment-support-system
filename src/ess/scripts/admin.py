import click
import transaction

from hashlib import sha512

from ..models import get_engine, get_session_factory, get_tm_session, User


def check_permission(dbsession, email, password, permission):
    """Check whether the User with the given email and password has the given permission."""
    user = dbsession.query(User).filter(User.email == email).first()
    if user:
        hash = sha512()
        hash.update(user.salt.encode('utf-8'))
        hash.update(b'$$')
        hash.update(password.encode('utf-8'))
        if user.password == hash.hexdigest() and user.has_permission(permission):
            return True
    return False


@click.command()
@click.pass_context
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
@click.argument('new-email')
@click.argument('new-name')
def add_user(ctx, email, password, new_email, new_name):
    """Add a new user with the e-mail address NEW_EMAIL and the name NEW_NAME"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        if check_permission(dbsession, email, password, 'admin.users'):
            if dbsession.query(User).filter(User.email == new_email).first():
                click.echo(click.style(f'A user with the e-mail address {new_email} is already registered', fg='red'))
            else:
                dbsession.add(User(email=new_email,
                                   salt=None,
                                   password=None,
                                   status='active',
                                   trust='low',
                                   groups=[],
                                   permissions=[],
                                   attributes={'name': new_name}))
                click.echo(click.style('User added', fg='green'))
        else:
            click.echo(click.style('You are not authorised to access this area', fg='red'))


@click.command()
@click.pass_context
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
@click.argument('delete-email')
@click.confirmation_option()
def delete_user(ctx, email, password, delete_email):
    """Delete the user with the e-mail address DELETE_EMAIL"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        if check_permission(dbsession, email, password, 'admin.users'):
            if dbsession.query(User).filter(User.email == delete_email).first():
                dbsession.query(User).filter(User.email == delete_email).delete()
                click.echo(click.style('User deleted', fg='green'))
            else:
                click.echo(click.style(f'No user with the e-mail address {delete_email} is registered', fg='green'))
        else:
            click.echo(click.style('You are not authorised to access this area', fg='red'))


@click.command()
@click.pass_context
@click.option('--email', prompt=True)
@click.option('--password', prompt=True, hide_input=True)
@click.argument('user-email')
@click.argument('status')
def set_user_status(ctx, email, password, user_email, status):
    """Sets the status of the user with the e-mail address USER_EMAIL to STATUS"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        if check_permission(dbsession, email, password, 'admin.users'):
            user = dbsession.query(User).filter(User.email == user_email).first()
            if user:
                user.status = status
                click.echo(click.style('User status updated', fg='green'))
            else:
                click.echo(click.style(f'No user with the e-mail address {user_email} is registered', fg='green'))
        else:
            click.echo(click.style('You are not authorised to access this area', fg='red'))
