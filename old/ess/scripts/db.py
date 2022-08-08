import click
import json
import transaction
from pkg_resources import resource_string

from ..models.meta import Base
from ..models import get_engine, get_session_factory, get_tm_session, QuestionTypeGroup, Setting
from ..views.api.question_type import import_question_type


@click.command()
@click.option('--drop-existing', is_flag=True, default=False, help='Drop the existing tables first')
@click.pass_context
def init_db(ctx, drop_existing):
    """Initialise the database structure"""
    engine = get_engine(ctx.obj['settings'])
    if drop_existing:
        Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with transaction.manager:
        engine = get_engine(ctx.obj['settings'])
        session_factory = get_session_factory(engine)
        dbsession = get_tm_session(session_factory, transaction.manager)
        question_type_group = dbsession.query(QuestionTypeGroup)\
            .filter(QuestionTypeGroup.source == 'https://biirrr.github.io/ess/questions').first()
        if not question_type_group:
            question_type_group = QuestionTypeGroup(title='Core Questions',
                                                    position=0,
                                                    enabled=True,
                                                    source='https://biirrr.github.io/ess/questions')
            dbsession.add(question_type_group)
        question_types = import_question_type(json.loads(resource_string('ess', 'scripts/questions.json')),
                                              dbsession,
                                              remap=False)
        question_type_group.question_types.extend(question_types)
        for idx, question_type in enumerate(question_types):
            question_type.enabled = True
            question_type.idx = idx

        if not dbsession.query(Setting).filter(Setting.key == 'registration.mode').first():
            dbsession.add(Setting(key='registration.mode',
                                  value='open',
                                  values=['open', 'domain', 'admin'],
                                  guidance='Set the registration mode to allow anybody (open), users with an e-mail ' +
                                           'in one ore more listed domains (domain), or registration only by admin ' +
                                           'users (admin).'))
        if not dbsession.query(Setting).filter(Setting.key == 'registration.domains').first():
            dbsession.add(Setting(key='registration.domains',
                                  value='',
                                  values=None,
                                  guidance='Set the domains that users may register from. Only used if the ' +
                                           'registration.mode is set to domain.'))
        if not dbsession.query(Setting).filter(Setting.key == 'registration.admin_confirmation').first():
            dbsession.add(Setting(key='registration.admin_confirmation',
                                  value='false',
                                  values=['true', 'false'],
                                  guidance='Whether after registration an administrator needs to confirm the ' +
                                           'registration.'))
