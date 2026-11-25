"""Business rules shared by the routers.

Everything here depends only on SQLAlchemy + Starlette's HTTPException (the same
exception FastAPI uses), so the rules can be unit-tested without the web layer.

Why these live in code rather than as database constraints: the SQLite tables
already exist (create_all never alters existing tables), so adding foreign keys
or UNIQUE constraints would need a migration. Enforcing them here works with
existing data and can be moved into a migration later.
"""
from typing import Dict, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

import models
import production_models
import workorder_models


def get_or_404(db: Session, model, obj_id: int, label: str):
    obj = db.get(model, obj_id)

    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} {obj_id} not found")

    return obj


def require_product(db: Session, product_id: int) -> None:
    if db.get(models.Product, product_id) is None:
        raise HTTPException(
            status_code=422,
            detail=f"Product {product_id} does not exist",
        )


def require_workorder(db: Session, workorder_id: int) -> None:
    if db.get(workorder_models.WorkOrder, workorder_id) is None:
        raise HTTPException(
            status_code=422,
            detail=f"Work order {workorder_id} does not exist",
        )


def ensure_unique_order_number(
    db: Session, order_number: str, exclude_id: Optional[int] = None
) -> None:
    query = db.query(workorder_models.WorkOrder).filter(
        workorder_models.WorkOrder.order_number == order_number
    )

    if exclude_id is not None:
        query = query.filter(workorder_models.WorkOrder.id != exclude_id)

    if query.first() is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Order number {order_number} already exists",
        )


def ensure_single_inventory(
    db: Session, product_id: int, exclude_id: Optional[int] = None
) -> None:
    query = db.query(models.Inventory).filter(
        models.Inventory.product_id == product_id
    )

    if exclude_id is not None:
        query = query.filter(models.Inventory.id != exclude_id)

    if query.first() is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Product {product_id} already has an inventory record",
        )


def product_blockers(db: Session, product_id: int) -> Dict[str, int]:
    """Records that still depend on a product and must be removed first."""
    counts = {
        "work order(s)": db.query(workorder_models.WorkOrder)
        .filter(workorder_models.WorkOrder.product_id == product_id)
        .count(),
        "production record(s)": db.query(production_models.Production)
        .filter(production_models.Production.product_id == product_id)
        .count(),
    }

    return {name: n for name, n in counts.items() if n}


def workorder_blockers(db: Session, workorder_id: int) -> Dict[str, int]:
    """Records that still depend on a work order and must be removed first."""
    counts = {
        "issue(s)": db.query(models.Issue)
        .filter(models.Issue.workorder_id == workorder_id)
        .count(),
    }

    return {name: n for name, n in counts.items() if n}


def ensure_unique_email(
    db: Session, email: str, exclude_id: Optional[int] = None
) -> None:
    query = db.query(models.User).filter(
        func.lower(models.User.email) == email.lower()
    )

    if exclude_id is not None:
        query = query.filter(models.User.id != exclude_id)

    if query.first() is not None:
        raise HTTPException(
            status_code=409,
            detail=f"A user with email {email} already exists",
        )


def ensure_admin_remains(
    db: Session,
    user: "models.User",
    new_role: Optional[str] = None,
    new_status: Optional[str] = None,
    deleting: bool = False,
) -> None:
    """Never let the system end up with nobody who can sign in as an Admin."""
    is_active_admin = user.role == "Admin" and user.status == "Active"
    stays_active_admin = (
        not deleting
        and (new_role or user.role) == "Admin"
        and (new_status or user.status) == "Active"
    )

    if not is_active_admin or stays_active_admin:
        return

    others = (
        db.query(models.User)
        .filter(
            models.User.id != user.id,
            models.User.role == "Admin",
            models.User.status == "Active",
            models.User.password_hash.isnot(None),
        )
        .count()
    )

    if others == 0:
        raise HTTPException(
            status_code=409,
            detail="This is the last active Admin who can sign in; "
            "make another Admin first.",
        )


def describe_blockers(blockers: Dict[str, int]) -> str:
    return ", ".join(f"{n} {name}" for name, n in blockers.items())


def product_names(db: Session) -> Dict[int, str]:
    return {pid: name for pid, name in db.query(
        models.Product.id, models.Product.product_name
    )}


def with_product_name(obj, names: Dict[int, str]) -> dict:
    """Serialise an ORM row to a dict and add the human-readable product name."""
    data = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    data["product_name"] = names.get(data.get("product_id"))
    return data
