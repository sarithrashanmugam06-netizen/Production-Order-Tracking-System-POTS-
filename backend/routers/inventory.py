from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import access
import crud
import models
import rules
import schemas
from database import get_db

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", dependencies=[access.authenticated], response_model=List[schemas.InventoryResponse])
def read_inventory(db: Session = Depends(get_db)):
    names = rules.product_names(db)
    return [rules.with_product_name(i, names) for i in crud.get_inventory(db)]


@router.post("/", dependencies=[access.master_editor], response_model=schemas.InventoryResponse, status_code=201)
def add_inventory(inventory: schemas.Inventory, db: Session = Depends(get_db)):
    rules.require_product(db, inventory.product_id)
    rules.ensure_single_inventory(db, inventory.product_id)

    created = crud.create_inventory(db, inventory)
    return rules.with_product_name(created, rules.product_names(db))


@router.put("/{inventory_id}", dependencies=[access.master_editor], response_model=schemas.InventoryResponse)
def edit_inventory(
    inventory_id: int,
    inventory: schemas.Inventory,
    db: Session = Depends(get_db),
):
    rules.get_or_404(db, models.Inventory, inventory_id, "Inventory record")
    rules.require_product(db, inventory.product_id)
    rules.ensure_single_inventory(db, inventory.product_id, exclude_id=inventory_id)

    updated = crud.update_inventory(db, inventory_id, inventory)
    return rules.with_product_name(updated, rules.product_names(db))


@router.delete("/{inventory_id}", dependencies=[access.master_editor])
def remove_inventory(inventory_id: int, db: Session = Depends(get_db)):
    rules.get_or_404(db, models.Inventory, inventory_id, "Inventory record")
    return crud.delete_inventory(db, inventory_id)
