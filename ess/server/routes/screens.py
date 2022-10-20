"""Functions for handling user routes."""
from fastapi import APIRouter, Depends
from sqlalchemy import select

from .experiments import view_experiment, edit_experiment
from ...models import get_session, Experiment, Screen, ScreenModel, CreateScreenModel, CompileScreenModel
from ..utils import FetchSingle
from ...compiler import compile_page


router = APIRouter(prefix='/experiments/{eid}/screens')


@router.post('/', response_model=ScreenModel)
async def create_screen(mdl: CreateScreenModel, experiment: Experiment = Depends(edit_experiment)) -> Screen:
    """Create a new screen in an experiment."""
    async with get_session() as dbsession:
        screen = Screen(name=mdl.name,
                        experiment_id=experiment.id,
                        code="Markdown('# Page Title')")
        dbsession.add(screen)
        await dbsession.commit()
    return screen


@router.get('/', response_model=list[ScreenModel])
async def get_screens(experiment: Experiment = Depends(edit_experiment)) -> list[Screen]:
    """Get all screens of an experiment."""
    async with get_session() as dbsession:
        query = select(Screen).filter(Screen.experiment_id == experiment.id)
        result = await dbsession.execute(query)
        return list(result.scalars())


view_screen = FetchSingle(Screen, 'sid')


@router.get('/{sid}', response_model=ScreenModel)
async def get_screen(experiment: Experiment = Depends(view_experiment), screen: Screen = Depends(view_screen)) -> Screen:  # noqa: E501
    """Get the screen with the identifier `sid`."""
    return screen


@router.post('/{sid}/compile')
async def post_compile(mdl: CompileScreenModel, experiment: Experiment = Depends(view_experiment)) -> dict:
    """Compile the screen."""
    return compile_page(mdl.code)
