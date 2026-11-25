"""End-to-end API tests. Run with: pytest  (needs the packages in requirements.txt
plus requirements-dev.txt)."""

PRODUCT = {
    "product_name": "Water Bottle", "category": "Plastic", "unit": "PCS",
    "price": 20, "quantity": 100, "status": "Active",
}


def workorder(product_id, number="WO-001", **overrides):
    data = {
        "order_number": number, "product_id": product_id, "quantity": 50,
        "production_line": "Line A", "start_date": "2026-07-01",
        "due_date": "2026-07-31", "priority": "High", "status": "Pending",
    }
    data.update(overrides)
    return data


def create_product(client, **overrides):
    response = client.post("/products/", json={**PRODUCT, **overrides})
    assert response.status_code == 201, response.text
    return response.json()


def test_health(client):
    assert client.get("/health").json() == {"status": "ok", "database": "connected"}


def test_product_validation(client):
    assert client.post("/products/", json={**PRODUCT, "price": 0}).status_code == 422
    assert client.post("/products/", json={**PRODUCT, "quantity": -1}).status_code == 422
    assert client.post("/products/", json={**PRODUCT, "status": "Maybe"}).status_code == 422
    assert client.post("/products/", json={**PRODUCT, "product_name": "   "}).status_code == 422


def test_missing_records_return_404_not_null(client):
    assert client.put("/products/999", json=PRODUCT).status_code == 404
    assert client.delete("/products/999").status_code == 404
    assert client.delete("/workorders/999").status_code == 404
    assert client.delete("/production/999").status_code == 404
    assert client.delete("/inventory/999").status_code == 404
    assert client.delete("/issues/999").status_code == 404
    assert client.delete("/users/999").status_code == 404


def test_work_order_rules(client):
    product = create_product(client)

    assert client.post("/workorders/", json=workorder(999)).status_code == 422
    assert client.post(
        "/workorders/",
        json=workorder(product["id"], start_date="2026-08-01", due_date="2026-07-01"),
    ).status_code == 422

    created = client.post("/workorders/", json=workorder(product["id"]))
    assert created.status_code == 201
    assert created.json()["product_name"] == "Water Bottle"

    duplicate = client.post("/workorders/", json=workorder(product["id"]))
    assert duplicate.status_code == 409

    listing = client.get("/workorders/").json()
    assert listing[0]["product_name"] == "Water Bottle"


def test_product_with_work_orders_cannot_be_deleted(client):
    product = create_product(client)
    wo = client.post("/workorders/", json=workorder(product["id"])).json()

    blocked = client.delete(f"/products/{product['id']}")
    assert blocked.status_code == 409
    assert "work order" in blocked.json()["detail"]

    assert client.delete(f"/workorders/{wo['id']}").status_code == 200
    assert client.delete(f"/products/{product['id']}").status_code == 200


def test_deleting_a_product_removes_its_stock_record(client):
    product = create_product(client)
    stock = client.post(
        "/inventory/",
        json={"product_id": product["id"], "current_stock": 5, "minimum_stock": 2},
    )
    assert stock.status_code == 201

    # Only one stock record per product.
    assert client.post(
        "/inventory/",
        json={"product_id": product["id"], "current_stock": 1, "minimum_stock": 1},
    ).status_code == 409

    assert client.delete(f"/products/{product['id']}").status_code == 200
    assert client.get("/inventory/").json() == []


def test_issues_need_a_real_work_order(client):
    issue = {
        "workorder_id": 123, "issue_type": "Other", "description": "Jam",
        "severity": "Low", "reported_date": "2026-07-02", "status": "Open",
    }
    assert client.post("/issues/", json=issue).status_code == 422

    product = create_product(client)
    wo = client.post("/workorders/", json=workorder(product["id"])).json()
    created = client.post("/issues/", json={**issue, "workorder_id": wo["id"]})
    assert created.status_code == 201

    # A work order that still has issues cannot be deleted.
    assert client.delete(f"/workorders/{wo['id']}").status_code == 409


def test_duplicate_user_email(client):
    user = {
        "name": "Bob", "email": "bob@example.com", "phone": "9876543210",
        "department": "Production", "role": "Supervisor", "status": "Active",
        "password": "Passw0rd!",
    }
    assert client.post("/users/", json=user).status_code == 201
    assert client.post("/users/", json=user).status_code == 409
    assert client.post("/users/", json={**user, "email": "BOB@example.com"}).status_code == 409  # case-insensitive
    assert client.post("/users/", json={**user, "email": "not-an-email"}).status_code == 422


def test_settings_round_trip(client):
    settings = client.get("/settings/").json()
    updated = {**settings, "company_name": "New Name", "dark_mode": True}
    updated.pop("id")

    response = client.put(f"/settings/{settings['id']}", json=updated)
    assert response.status_code == 200
    assert response.json()["company_name"] == "New Name"
    assert client.put("/settings/999", json=updated).status_code == 404
