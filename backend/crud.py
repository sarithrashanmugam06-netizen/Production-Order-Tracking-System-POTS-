from sqlalchemy.orm import Session
import models
import schemas


# -----------------------------
# GET ALL PRODUCTS
# -----------------------------
def get_products(db: Session):
    return db.query(models.Product).all()


# -----------------------------
# GET PRODUCT BY ID
# -----------------------------
def get_product(db: Session, product_id: int):
    return (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )


# -----------------------------
# CREATE PRODUCT
# -----------------------------
def create_product(db: Session, product: schemas.Product):
    db_product = models.Product(
        product_name=product.product_name,
        category=product.category,
        unit=product.unit,
        price=product.price,
        quantity=product.quantity,
        status=product.status,
    )

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product


# -----------------------------
# UPDATE PRODUCT
# -----------------------------
def update_product(
    db: Session,
    product_id: int,
    product: schemas.Product,
):
    db_product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if db_product is None:
        return None

    db_product.product_name = product.product_name
    db_product.category = product.category
    db_product.unit = product.unit
    db_product.price = product.price
    db_product.quantity = product.quantity
    db_product.status = product.status

    db.commit()
    db.refresh(db_product)

    return db_product


# -----------------------------
# DELETE PRODUCT
# -----------------------------
def delete_product(db: Session, product_id: int):
    db_product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if db_product is None:
        return None

    db.delete(db_product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


# -----------------------------
# GET INVENTORY
# -----------------------------
def get_inventory(db: Session):
    return db.query(models.Inventory).all()


# -----------------------------
# CREATE INVENTORY
# -----------------------------
def create_inventory(
    db: Session,
    inventory: schemas.Inventory,
):
    db_inventory = models.Inventory(
        product_id=inventory.product_id,
        current_stock=inventory.current_stock,
        minimum_stock=inventory.minimum_stock,
    )

    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)

    return db_inventory


# -----------------------------
# UPDATE INVENTORY
# -----------------------------
def update_inventory(
    db: Session,
    inventory_id: int,
    inventory: schemas.Inventory,
):
    db_inventory = (
        db.query(models.Inventory)
        .filter(models.Inventory.id == inventory_id)
        .first()
    )

    if db_inventory is None:
        return None

    db_inventory.product_id = inventory.product_id
    db_inventory.current_stock = inventory.current_stock
    db_inventory.minimum_stock = inventory.minimum_stock

    db.commit()
    db.refresh(db_inventory)

    return db_inventory


# -----------------------------
# DELETE INVENTORY
# -----------------------------
def delete_inventory(
    db: Session,
    inventory_id: int,
):
    db_inventory = (
        db.query(models.Inventory)
        .filter(models.Inventory.id == inventory_id)
        .first()
    )

    if db_inventory is None:
        return None

    db.delete(db_inventory)
    db.commit()

    return {
        "message": "Inventory Deleted Successfully"
    }