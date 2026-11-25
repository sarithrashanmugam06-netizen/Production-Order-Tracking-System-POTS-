"""Unit tests for the business rules (SQLAlchemy only, no web layer)."""
from datetime import date

import pytest
from starlette.exceptions import HTTPException

import models
import production_models
import rules
import workorder_models


def make_product(db, name="Bottle", status="Active"):
    product = models.Product(
        product_name=name, category="Plastic", unit="PCS",
        price=10.0, quantity=5, status=status,
    )
    db.add(product)
    db.commit()
    return product


def make_workorder(db, product_id, number="WO-001"):
    wo = workorder_models.WorkOrder(
        order_number=number, product_id=product_id, quantity=10,
        production_line="Line A", start_date=date(2026, 1, 1),
        due_date=date(2026, 2, 1), priority="Low", status="Pending",
    )
    db.add(wo)
    db.commit()
    return wo


def status_of(exc_info):
    return exc_info.value.status_code


def test_get_or_404(db):
    product = make_product(db)
    assert rules.get_or_404(db, models.Product, product.id, "Product").id == product.id

    with pytest.raises(HTTPException) as exc:
        rules.get_or_404(db, models.Product, 999, "Product")
    assert status_of(exc) == 404


def test_require_product(db):
    product = make_product(db)
    rules.require_product(db, product.id)  # no error

    with pytest.raises(HTTPException) as exc:
        rules.require_product(db, 999)
    assert status_of(exc) == 422


def test_require_workorder(db):
    wo = make_workorder(db, make_product(db).id)
    rules.require_workorder(db, wo.id)

    with pytest.raises(HTTPException) as exc:
        rules.require_workorder(db, 999)
    assert status_of(exc) == 422


def test_order_number_must_be_unique_but_may_be_kept_on_edit(db):
    wo = make_workorder(db, make_product(db).id, "WO-001")

    with pytest.raises(HTTPException) as exc:
        rules.ensure_unique_order_number(db, "WO-001")
    assert status_of(exc) == 409

    rules.ensure_unique_order_number(db, "WO-001", exclude_id=wo.id)  # editing itself
    rules.ensure_unique_order_number(db, "WO-002")


def test_one_inventory_record_per_product(db):
    product = make_product(db)
    stock = models.Inventory(product_id=product.id, current_stock=1, minimum_stock=1)
    db.add(stock)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        rules.ensure_single_inventory(db, product.id)
    assert status_of(exc) == 409

    rules.ensure_single_inventory(db, product.id, exclude_id=stock.id)


def test_product_blockers_count_work_orders_and_production(db):
    product = make_product(db)
    assert rules.product_blockers(db, product.id) == {}

    make_workorder(db, product.id)
    db.add(production_models.Production(
        product_id=product.id, production_line="Line A", target_quantity=10,
        produced_quantity=1, production_date=date(2026, 1, 1), status="Running",
    ))
    db.commit()

    blockers = rules.product_blockers(db, product.id)
    assert blockers == {"work order(s)": 1, "production record(s)": 1}
    assert "1 work order(s)" in rules.describe_blockers(blockers)


def test_workorder_blockers_count_issues(db):
    wo = make_workorder(db, make_product(db).id)
    assert rules.workorder_blockers(db, wo.id) == {}

    db.add(models.Issue(
        workorder_id=wo.id, issue_type="Other", description="x",
        severity="Low", reported_date=date(2026, 1, 1), status="Open",
    ))
    db.commit()

    assert rules.workorder_blockers(db, wo.id) == {"issue(s)": 1}


def test_user_email_must_be_unique(db):
    user = models.User(
        name="A", email="a@x.com", phone="1234567", department="Prod",
        role="Planner", status="Active",
    )
    db.add(user)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        rules.ensure_unique_email(db, "a@x.com")
    assert status_of(exc) == 409

    rules.ensure_unique_email(db, "a@x.com", exclude_id=user.id)
    rules.ensure_unique_email(db, "b@x.com")


def test_with_product_name_adds_name_or_none(db):
    product = make_product(db, "Steel Pipe")
    wo = make_workorder(db, product.id)
    names = rules.product_names(db)

    assert rules.with_product_name(wo, names)["product_name"] == "Steel Pipe"
    assert rules.with_product_name(wo, {})["product_name"] is None
