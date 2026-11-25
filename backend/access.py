"""FastAPI dependencies: who is calling, and are they allowed?"""
import os
from pathlib import Path

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import models
import roles
import security
from database import get_db

BASE_DIR = Path(__file__).resolve().parent

SECRET_KEY = security.load_secret_key(BASE_DIR / ".secret_key")
TOKEN_TTL_SECONDS = int(os.getenv("TOKEN_TTL_MINUTES", "480")) * 60

bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTHENTICATED = {"WWW-Authenticate": "Bearer"}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if credentials is None:
        raise HTTPException(401, "Not authenticated", headers=_UNAUTHENTICATED)

    try:
        claims = security.decode_token(credentials.credentials, SECRET_KEY)
        user_id = int(claims["sub"])
    except (security.TokenError, KeyError, ValueError, TypeError):
        raise HTTPException(
            401, "Your session is invalid or has expired", headers=_UNAUTHENTICATED
        )

    # Always re-read the user: a deactivated user or changed role takes effect
    # immediately, not when the token expires.
    user = db.get(models.User, user_id)

    if user is None or user.status != "Active":
        raise HTTPException(
            401, "Your session is invalid or has expired", headers=_UNAUTHENTICATED
        )

    return user


def require_roles(*allowed):
    def checker(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role not in allowed:
            raise HTTPException(403, "You do not have permission to do this")
        return user

    return checker


# Ready-made dependencies for the routers
authenticated = Depends(get_current_user)
master_editor = Depends(require_roles(*roles.MASTER_DATA_EDITORS))
ops_editor = Depends(require_roles(*roles.OPERATIONS_EDITORS))
admin_only = Depends(require_roles(*roles.ADMINS_ONLY))
