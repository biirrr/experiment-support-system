import click
import transaction

from datetime import datetime, timedelta
from sqlalchemy import and_

from ..models import get_engine, get_session_factory, get_tm_session, User


@click.command()
@click.pass_context
def cron(ctx):
    """Run regular maintenance tasks"""
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        cutoff = datetime.utcnow() - timedelta(days=2)
        dbsession.query(User).filter(and_(User.status == 'new', User.created < cutoff)).delete()
