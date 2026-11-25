from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

import access
import models
import rules
import security
import user_schema
from database import get_db

# Everything about users is Admin-only.
router = APIRouter(prefix="/users", tags=["Users"], dependencies=[access.admin_only])


@router.get("/", response_model=List[user_schema.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@router.post("/", response_model=user_schema.UserResponse, status_code=201)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    rules.ensure_unique_email(db, user.email)

    new_user = models.User(
        **user.model_dump(exclude={"password"}),
        password_hash=security.hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.put("/{user_id}", response_model=user_schema.UserResponse)
def update_user(
    user_id: int,
    user: user_schema.UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = rules.get_or_404(db, models.User, user_id, "User")
    rules.ensure_unique_email(db, user.email, exclude_id=user_id)
    rules.ensure_admin_remains(
        db, db_user, new_role=user.role, new_status=user.status
    )

    for field, value in user.model_dump(exclude={"password"}).items():
        setattr(db_user, field, value)

    if user.password:
        db_user.password_hash = security.hash_password(user.password)

    db.commit()
    db.refresh(db_user)

    return db_user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = access.admin_only,
):
    db_user = rules.get_or_404(db, models.User, user_id, "User")

    if db_user.id == current_user.id:
        raise HTTPException(
            status_code=400, detail="You cannot delete your own account"
        )

    rules.ensure_admin_remains(db, db_user, deleting=True)

    db.delete(db_user)
    db.commit()

    return {"message": "User deleted successfully"}
