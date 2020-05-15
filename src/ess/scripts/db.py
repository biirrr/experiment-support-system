import click
import requests
import transaction

from ..models.meta import Base
from ..models import get_engine, get_session_factory, get_tm_session, QuestionTypeGroup
from ..views.api.question_type import import_question_type


DEFAULT_QUESTION_TYPES = [
    ('https://biirrr.github.io/usef/questions/USEFQuestion/v0_2_0.json', 'Abstract Question'),
    ('https://biirrr.github.io/usef/questions/USEFDisplay/v0_2_0.json', 'Text Display'),
    ('https://biirrr.github.io/usef/questions/USEFSingleLineInput/v0_2_0.json', 'Single-line Input'),
    ('https://biirrr.github.io/usef/questions/USEFMultiLineInput/v0_2_0.json', 'Multi-line Input'),
    ('https://biirrr.github.io/usef/questions/USEFSingleChoice/v0_2_0.json', 'Single Choice'),
    ('https://biirrr.github.io/usef/questions/USEFMultiChoice/v0_2_0.json', 'Multiple Choice'),
    ('https://biirrr.github.io/usef/questions/USEFHidden/v0_2_0.json', 'Hidden'),
    ('https://biirrr.github.io/usef/questions/USEFSingleChoiceGrid/v0_2_0.json', 'Single-choice Grid'),
    ('https://biirrr.github.io/usef/questions/USEFMultiChoiceGrid/v0_2_0.json', 'Multi-choice Grid'),
]


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
            .filter(QuestionTypeGroup.source == 'https://biirrr.github.io/usef/questions/').first()
        if not question_type_group:
            question_type_group = QuestionTypeGroup(title='Core Questions',
                                                    position=0,
                                                    enabled=True,
                                                    source='https://biirrr.github.io/usef/questions/')
            dbsession.add(question_type_group)
        for idx, source in enumerate(DEFAULT_QUESTION_TYPES):
            response = requests.get(source[0])
            if response.status_code == 200:
                question_type = import_question_type(response.json(), dbsession)
                question_type.title = source[1]
                question_type.enabled = source[1] != 'Abstract Question'
                question_type.position = idx
                question_type.question_type_group = question_type_group
                dbsession.add(question_type)
                dbsession.flush()
