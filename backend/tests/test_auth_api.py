"""Sign-in, roles and lock-outs, tested through the real HTTP API."""
import time

import pytest

import access
import security

PASSWORD = "Passw0rd!"  # same as conftest.PASSWORD

PRODUCT = {
    "product_name": "Bottle", "category": "Plastic", "unit": "PCS",
    "price": 5, "quantity": 10, "status": "Active",
}
PUBLIC_ROUTES = {"/", "/health", "/auth/login", "/openapi.json", "/docs", "/redoc",
                 "/docs/oauth2-redirect"}


def test_every_data_route_requires_sign_in(anon):
    """If someone adds a router and forgets to protect it, this fails."""
    from main import app

    for route in app.routes:
        if route.path in PUBLIC_ROUTES or not hasattr(route, "methods"):
            continue
        for method in route.methods - {"HEAD", "OPTIONS"}:
            path = route.path.replace("{product_id}", "1").replace("{user_id}", "1") \
                .replace("{inventory_id}", "1").replace("{workorder_id}", "1") \
                .replace("{production_id}", "1").replace("{issue_id}", "1") \
                .replace("{settings_id}", "1")
            response = anon.request(method, path, json={})
            assert response.status_code == 401, f"{method} {route.path} is not protected"


def test_login_success_returns_token_and_no_password_data(anon, login_as):
    login_as("Planner")
    response = anon.post("/auth/login", json={"email": "planner1@test.com", "password": PASSWORD})
    body = response.json()
    assert response.status_code == 200
    assert body["token_type"] == "bearer" and body["user"]["role"] == "Planner"
    assert "password_hash" not in body["user"] and "password" not in body["user"]


def test_login_is_case_insensitive_on_email(anon, login_as):
    login_as("Admin")
    response = anon.post("/auth/login", json={"email": "ADMIN1@TEST.COM", "password": PASSWORD})
    assert response.status_code == 200


def test_wrong_password_and_unknown_email_look_identical(anon, login_as):
    login_as("Admin")
    wrong = anon.post("/auth/login", json={"email": "admin1@test.com", "password": "nope-nope"})
    unknown = anon.post("/auth/login", json={"email": "ghost@test.com", "password": "nope-nope"})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()


def test_repeated_failures_lock_the_login_out(anon, login_as):
    login_as("Admin")
    for _ in range(5):
        assert anon.post("/auth/login", json={"email": "admin1@test.com", "password": "bad-bad-bad"}).status_code == 401

    blocked = anon.post("/auth/login", json={"email": "admin1@test.com", "password": PASSWORD})
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) > 0


def test_inactive_user_cannot_sign_in_and_is_cut_off_immediately(client, anon, login_as):
    headers = login_as("Planner")
    assert anon.get("/products/", headers=headers).status_code == 200

    user = next(u for u in client.get("/users/").json() if u["role"] == "Planner")
    update = {**{k: user[k] for k in ("name", "email", "phone", "department", "role")}, "status": "Inactive"}
    assert client.put(f"/users/{user['id']}", json=update).status_code == 200

    # The token is still cryptographically valid, but the account is switched off.
    assert anon.get("/products/", headers=headers).status_code == 401
    assert anon.post("/auth/login", json={"email": user["email"], "password": PASSWORD}).status_code == 401


def test_bad_tokens_are_rejected(anon):
    assert anon.get("/products/", headers={"Authorization": "Bearer garbage"}).status_code == 401
    expired = security.create_token({"sub": "1"}, access.SECRET_KEY, 60, now=time.time() - 3600)
    assert anon.get("/products/", headers={"Authorization": f"Bearer {expired}"}).status_code == 401
    forged = security.create_token({"sub": "1"}, "not-the-server-secret", 3600)
    assert anon.get("/products/", headers={"Authorization": f"Bearer {forged}"}).status_code == 401


def test_me_returns_the_current_user(anon, login_as):
    me = anon.get("/auth/me", headers=login_as("Supervisor")).json()
    assert me["role"] == "Supervisor" and "password_hash" not in me


# ----------------------------------------------------------------- role matrix
def test_planner_can_edit_master_data_but_not_users_or_settings(anon, login_as):
    planner = login_as("Planner")
    assert anon.post("/products/", json=PRODUCT, headers=planner).status_code == 201
    assert anon.get("/users/", headers=planner).status_code == 403
    assert anon.get("/settings/", headers=planner).status_code == 403


def test_supervisor_works_the_floor_but_cannot_change_master_data(anon, login_as, client):
    product = client.post("/products/", json=PRODUCT).json()
    supervisor = login_as("Supervisor")

    assert anon.get("/products/", headers=supervisor).status_code == 200      # can read
    assert anon.post("/products/", json=PRODUCT, headers=supervisor).status_code == 403
    production = {"product_id": product["id"], "production_line": "Line A", "target_quantity": 10,
                  "produced_quantity": 1, "production_date": "2026-07-01", "status": "Running"}
    assert anon.post("/production/", json=production, headers=supervisor).status_code == 201


def test_management_is_read_only(anon, login_as, client):
    product = client.post("/products/", json=PRODUCT).json()
    management = login_as("Management")

    for path in ("/products/", "/inventory/", "/workorders/", "/production/", "/issues/"):
        assert anon.get(path, headers=management).status_code == 200
    assert anon.delete(f"/products/{product['id']}", headers=management).status_code == 403
    assert anon.post("/production/", json={}, headers=management).status_code == 403
    assert anon.get("/users/", headers=management).status_code == 403


# ----------------------------------------------------------------------- users
USER = {"name": "Kim", "email": "kim@example.com", "phone": "9876543210",
        "department": "Planning", "role": "Planner", "status": "Active", "password": "Sup3rSecret"}


def test_user_responses_never_contain_password_data(client):
    client.post("/users/", json=USER)
    for user in client.get("/users/").json():
        assert "password" not in user and "password_hash" not in user


def test_new_users_need_a_decent_password(client):
    assert client.post("/users/", json={k: v for k, v in USER.items() if k != "password"}).status_code == 422
    assert client.post("/users/", json={**USER, "password": "short"}).status_code == 422
    assert client.post("/users/", json={**USER, "role": "Wizard"}).status_code == 422


def test_editing_a_user_without_a_password_keeps_the_old_one(client, anon):
    created = client.post("/users/", json=USER).json()
    edit = {k: v for k, v in USER.items() if k != "password"} | {"name": "Kimberly"}
    assert client.put(f"/users/{created['id']}", json=edit).status_code == 200
    assert anon.post("/auth/login", json={"email": USER["email"], "password": USER["password"]}).status_code == 200


def test_admin_can_reset_a_password(client, anon):
    created = client.post("/users/", json=USER).json()
    edit = {k: v for k, v in USER.items() if k != "password"} | {"password": "BrandNewPass1"}
    assert client.put(f"/users/{created['id']}", json=edit).status_code == 200
    assert anon.post("/auth/login", json={"email": USER["email"], "password": USER["password"]}).status_code == 401
    assert anon.post("/auth/login", json={"email": USER["email"], "password": "BrandNewPass1"}).status_code == 200


def test_an_admin_cannot_delete_themselves_or_the_last_admin(client):
    me = client.get("/auth/me").json()
    assert client.delete(f"/users/{me['id']}").status_code == 400

    demote = {k: me[k] for k in ("name", "email", "phone", "department")} | {"role": "Planner", "status": "Active"}
    assert client.put(f"/users/{me['id']}", json=demote).status_code == 409
