from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

import access
import rules
import workorder_crud
import workorder_models
import workorder_schemas as schemas
from database import get_db

router = APIRouter(prefix="/workorders", tags=["Work Orders"])


@router.get("/", dependencies=[access.authenticated], response_model=List[schemas.WorkOrderResponse])
def read_workorders(db: Session = Depends(get_db)):
    names = rules.product_names(db)
    return [
        rules.with_product_name(w, names)
        for w in workorder_crud.get_workorders(db)
    ]


@router.post("/", dependencies=[access.master_editor], response_model=schemas.WorkOrderResponse, status_code=201)
def add_workorder(workorder: schemas.WorkOrder, db: Session = Depends(get_db)):
    rules.require_product(db, workorder.product_id)
    rules.ensure_unique_order_number(db, workorder.order_number)

    created = workorder_crud.create_workorder(db, workorder)
    return rules.with_product_name(created, rules.product_names(db))


@router.put("/{workorder_id}", dependencies=[access.master_editor], response_model=schemas.WorkOrderResponse)
def update_workorder(
    workorder_id: int,
    workorder: schemas.WorkOrder,
    db: Session = Depends(get_db),
):
    rules.get_or_404(db, workorder_models.WorkOrder, workorder_id, "Work order")
    rules.require_product(db, workorder.product_id)
    rules.ensure_unique_order_number(
        db, workorder.order_number, exclude_id=workorder_id
    )

    updated = workorder_crud.update_workorder(db, workorder_id, workorder)
    return rules.with_product_name(updated, rules.product_names(db))


@router.delete("/{workorder_id}", dependencies=[access.master_editor])
def delete_workorder(workorder_id: int, db: Session = Depends(get_db)):
    rules.get_or_404(db, workorder_models.WorkOrder, workorder_id, "Work order")

    blockers = rules.workorder_blockers(db, workorder_id)
    if blockers:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete this work order: it still has "
            + rules.describe_blockers(blockers),
        )

    return workorder_crud.delete_workorder(db, workorder_id)
