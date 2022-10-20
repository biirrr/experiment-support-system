"""Utility functions."""
from fastapi import Depends
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from sqlalchemy import select

from .security import authenticated_user
from ..models import Base, User, get_session


class FetchSingle:
    """Callable that fetches a single database record."""

    def __init__(self: 'FetchSingle', cls: Base, param_name: str, authorisation: str | None = None) -> None:
        """Create a custom callable.

        :param cls: The SQLAlchemy model class
        :type cls: :class:`~ess.models.meta.Base`
        :param param_name: The name of the path parameter with the record id
        :type param_name: str
        :param authorisation: If specified checks that the current user is authorised for this action on the record
        :type authorisation: str
        :return: Instance of the model class with the data for the specific database record
        :rtype: `cls`
        """
        self._cls = cls
        self._param_name = param_name
        self._authorisation = authorisation

    async def __call__(self: 'FetchSingle', request: Request, user: User = Depends(authenticated_user)) -> None:
        """Fetch the record from the database."""
        async with get_session() as dbsession:
            query = select(self._cls).filter(self._cls.id == int(request.path_params[self._param_name][0]))
            result = await dbsession.execute(query)
            single = result.scalar()
            if single is None:
                raise HTTPException(404)
            elif self._authorisation is not None and not single.is_authorised(user, self._authorisation):
                raise HTTPException(403)
        return single
