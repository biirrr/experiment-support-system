"""Functions for handling user routes."""
from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from sqlalchemy import select

from ...models import get_session, User, Experiment, ExperimentModel, CreateExperimentModel
from ..security import authenticated_user


router = APIRouter(prefix='/experiments')


@router.post('/', response_model=ExperimentModel)
async def create_experiment(mdl: CreateExperimentModel, user: User = Depends(authenticated_user)) -> Experiment:
    """Create a new experiment."""
    async with get_session() as dbsession:
        experiment = Experiment(owner_id=user.id, title=mdl.title, status='development')
        dbsession.add(experiment)
        await dbsession.commit()
    return experiment


@router.get('/', response_model=list[ExperimentModel])
async def get_experiments(user: User = Depends(authenticated_user)) -> list[Experiment]:
    """Get all experiments of the user."""
    async with get_session() as dbsession:
        query = select(Experiment).filter(Experiment.owner_id == user.id)
        result = await dbsession.execute(query)
        return list(result.scalars())


@router.get('/{eid}', response_model=ExperimentModel)
async def get_experiment(eid: int, user: User = Depends(authenticated_user)) -> Experiment:
    """Get an experiment."""
    async with get_session() as dbsession:
        query = select(Experiment).filter(Experiment.id == eid)
        result = await dbsession.execute(query)
        experiment = result.scalar()
        if experiment is None:
            raise HTTPException(404)
        elif experiment.owner_id != user.id:
            raise HTTPException(403)
    return experiment
