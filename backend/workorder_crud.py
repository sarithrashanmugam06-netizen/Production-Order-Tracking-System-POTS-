from sqlalchemy.orm import Session

import workorder_models as models
import workorder_schemas as schemas


# -------------------------
# GET ALL WORK ORDERS
# -------------------------
def get_workorders(db: Session):
    return db.query(models.WorkOrder).all()


# -------------------------
# CREATE WORK ORDER
# -------------------------
def create_workorder(
    db: Session,
    workorder: schemas.WorkOrder,
):
    db_workorder = models.WorkOrder(
        order_number=workorder.order_number,
        product_id=workorder.product_id,
        quantity=workorder.quantity,
        production_line=workorder.production_line,
        start_date=workorder.start_date,
        due_date=workorder.due_date,
        priority=workorder.priority,
        status=workorder.status,
    )

    db.add(db_workorder)
    db.commit()
    db.refresh(db_workorder)

    return db_workorder


# -------------------------
# UPDATE WORK ORDER
# -------------------------
def update_workorder(
    db: Session,
    workorder_id: int,
    workorder: schemas.WorkOrder,
):
    db_workorder = (
        db.query(models.WorkOrder)
        .filter(models.WorkOrder.id == workorder_id)
        .first()
    )

    if db_workorder is None:
        return None

    db_workorder.order_number = workorder.order_number
    db_workorder.product_id = workorder.product_id
    db_workorder.quantity = workorder.quantity
    db_workorder.production_line = workorder.production_line
    db_workorder.start_date = workorder.start_date
    db_workorder.due_date = workorder.due_date
    db_workorder.priority = workorder.priority
    db_workorder.status = workorder.status

    db.commit()
    db.refresh(db_workorder)

    return db_workorder


# -------------------------
# DELETE WORK ORDER
# -------------------------
def delete_workorder(
    db: Session,
    workorder_id: int,
):
    db_workorder = (
        db.query(models.WorkOrder)
        .filter(models.WorkOrder.id == workorder_id)
        .first()
    )

    if db_workorder is None:
        return None

    db.delete(db_workorder)
    db.commit()

    return {"message": "Work Order Deleted Successfully"}