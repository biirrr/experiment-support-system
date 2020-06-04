import click
import json
import transaction
from pkg_resources import resource_string

from ..models.meta import Base
from ..models import get_engine, get_session_factory, get_tm_session, QuestionTypeGroup
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
