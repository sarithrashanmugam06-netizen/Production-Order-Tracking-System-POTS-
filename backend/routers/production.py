from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import access
import production_crud
import production_models
import production_schemas as schemas
import rules
from database import get_db

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("/", dependencies=[access.authenticated], response_model=List[schemas.ProductionResponse])
def read_productions(db: Session = Depends(get_db)):
    names = rules.product_names(db)
    return [
        rules.with_product_name(p, names)
        for p in production_crud.get_productions(db)
    ]


@router.post("/", dependencies=[access.ops_editor], response_model=schemas.ProductionResponse, status_code=201)
def add_production(production: schemas.Production, db: Session = Depends(get_db)):
    rules.require_product(db, production.product_id)

    created = production_crud.create_production(db, production)
    return rules.with_product_name(created, rules.product_names(db))


@router.put("/{production_id}", dependencies=[access.ops_editor], response_model=schemas.ProductionResponse)
def update_production(
    production_id: int,
    production: schemas.Production,
    db: Session = Depends(get_db),
):
    rules.get_or_404(
        db, production_models.Production, production_id, "Production record"
    )
    rules.require_product(db, production.product_id)

    updated = production_crud.update_production(db, production_id, production)
    return rules.with_product_name(updated, rules.product_names(db))


@router.delete("/{production_id}", dependencies=[access.ops_editor])
def delete_production(production_id: int, db: Session = Depends(get_db)):
    rules.get_or_404(
        db, production_models.Production, production_id, "Production record"
    )
    return production_crud.delete_production(db, production_id)
