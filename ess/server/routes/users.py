"""Functions for handling user routes."""
from fastapi import APIRouter, Depends

from ...models import User, UserModel
from ..security import authenticated_user


router = APIRouter(prefix='/users')


@router.get('/current', response_model=UserModel)
async def get_current_user(user: User = Depends(authenticated_user)) -> dict:
    """Return a test message."""
    return user
