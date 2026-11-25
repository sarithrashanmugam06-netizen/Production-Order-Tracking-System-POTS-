from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

import access
import models
import security
import user_schema
from database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

throttle = security.LoginThrottle(max_failures=5, window=15 * 60)


@router.post("/login", response_model=user_schema.LoginResponse)
def login(
    data: user_schema.LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    key = f"{data.email.lower()}|{client_ip}"

    try:
        throttle.check(key)
    except security.TooManyAttempts as exc:
        raise HTTPException(
            status_code=429,
            detail=str(exc),
            headers={"Retry-After": str(exc.retry_after)},
        )

    user = (
        db.query(models.User)
        .filter(func.lower(models.User.email) == data.email.lower())
        .first()
    )

    if user is None:
        security.burn_time_like_a_real_check(data.password)
        valid = False
    else:
        valid = security.verify_password(data.password, user.password_hash)

    # One message for every failure so the response never reveals which emails exist.
    if not valid or user.status != "Active":
        throttle.record_failure(key)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    throttle.reset(key)

    token = security.create_token(
        {"sub": str(user.id), "role": user.role},
        access.SECRET_KEY,
        access.TOKEN_TTL_SECONDS,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": access.TOKEN_TTL_SECONDS,
        "user": user,
    }


@router.get("/me", response_model=user_schema.UserResponse)
def me(current_user: models.User = access.authenticated):
    return current_user
