from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException

import access
import crud
import models
import rules
import schemas
from database import get_db

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", dependencies=[access.authenticated], response_model=List[schemas.ProductResponse])
def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)


@router.get("/{product_id}", dependencies=[access.authenticated], response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    return rules.get_or_404(db, models.Product, product_id, "Product")


@router.post("/", dependencies=[access.master_editor], response_model=schemas.ProductResponse, status_code=201)
def add_product(product: schemas.Product, db: Session = Depends(get_db)):
    return crud.create_product(db, product)


@router.put("/{product_id}", dependencies=[access.master_editor], response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product: schemas.Product,
    db: Session = Depends(get_db),
):
    rules.get_or_404(db, models.Product, product_id, "Product")
    return crud.update_product(db, product_id, product)


@router.delete("/{product_id}", dependencies=[access.master_editor])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    rules.get_or_404(db, models.Product, product_id, "Product")

    blockers = rules.product_blockers(db, product_id)
    if blockers:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete this product: it is still used by "
            + rules.describe_blockers(blockers),
        )

    # A product's stock record has no meaning without the product, so remove it
    # in the same transaction instead of leaving an orphan behind.
    db.query(models.Inventory).filter(
        models.Inventory.product_id == product_id
    ).delete()

    return crud.delete_product(db, product_id)
