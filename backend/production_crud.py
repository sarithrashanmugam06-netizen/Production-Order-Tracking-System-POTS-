from sqlalchemy.orm import Session

import production_models as models
import production_schemas as schemas


# -------------------------
# GET ALL PRODUCTION
# -------------------------
def get_productions(db: Session):
    return db.query(models.Production).all()


# -------------------------
# CREATE PRODUCTION
# -------------------------
def create_production(
    db: Session,
    production: schemas.Production,
):
    db_production = models.Production(
        product_id=production.product_id,
        production_line=production.production_line,
        target_quantity=production.target_quantity,
        produced_quantity=production.produced_quantity,
        production_date=production.production_date,
        status=production.status,
    )

    db.add(db_production)
    db.commit()
    db.refresh(db_production)

    return db_production


# -------------------------
# UPDATE PRODUCTION
# -------------------------
def update_production(
    db: Session,
    production_id: int,
    production: schemas.Production,
):
    db_production = (
        db.query(models.Production)
        .filter(models.Production.id == production_id)
        .first()
    )

    if db_production is None:
        return None

    db_production.product_id = production.product_id
    db_production.production_line = production.production_line
    db_production.target_quantity = production.target_quantity
    db_production.produced_quantity = production.produced_quantity
    db_production.production_date = production.production_date
    db_production.status = production.status

    db.commit()
    db.refresh(db_production)

    return db_production


# -------------------------
# DELETE PRODUCTION
# -------------------------
def delete_production(
    db: Session,
    production_id: int,
):
    db_production = (
        db.query(models.Production)
        .filter(models.Production.id == production_id)
        .first()
    )

    if db_production is None:
        return None

    db.delete(db_production)
    db.commit()

    return {"message": "Production Deleted Successfully"}