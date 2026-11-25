import os
import sys
import tempfile
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

# Point the app at a throw-away database *before* anything imports `database`.
_tmp_dir = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_tmp_dir) / 'test.db'}"

from database import Base, SessionLocal, engine  # noqa: E402

import models  # noqa: E402,F401
import security  # noqa: E402
import production_models  # noqa: E402,F401
import settings_models  # noqa: E402,F401
import workorder_models  # noqa: E402,F401


def _reset_database():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)


@pytest.fixture()
def db():
    _reset_database()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


PASSWORD = "Passw0rd!"


def _create_user(role, email):
    session = SessionLocal()
    session.add(
        models.User(
            name=role, email=email, phone="1234567", department="Production",
            role=role, status="Active",
            password_hash=security.hash_password(PASSWORD),
        )
    )
    session.commit()
    session.close()


@pytest.fixture()
def anon():
    """A client that is NOT signed in."""
    from fastapi.testclient import TestClient

    import main  # noqa: F401  (makes sure the app and its routers are loaded)
    from main import app
    from routers.auth import throttle

    _reset_database()
    throttle._failures.clear()
    return TestClient(app)


@pytest.fixture()
def login_as(anon):
    """login_as("Planner") -> Authorization headers for a new user with that role."""
    counter = {"n": 0}

    def make(role="Admin"):
        counter["n"] += 1
        email = f"{role.lower()}{counter['n']}@test.com"
        _create_user(role, email)
        response = anon.post("/auth/login", json={"email": email, "password": PASSWORD})
        assert response.status_code == 200, response.text
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    return make


@pytest.fixture()
def client(login_as):
    """A separate client signed in as an Admin (most tests just want things to work).
    Pass headers=login_as("Planner") on a call to act as someone else."""
    from fastapi.testclient import TestClient

    from main import app

    admin_client = TestClient(app)
    admin_client.headers.update(login_as("Admin"))
    return admin_client
