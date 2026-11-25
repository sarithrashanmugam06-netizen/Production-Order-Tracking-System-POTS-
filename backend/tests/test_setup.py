"""Migration, first-run admin and admin-safety rules (SQLAlchemy only)."""
import os
import sqlite3
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect
from starlette.exceptions import HTTPException

import bootstrap
import migrations
import models
import rules
import security


def add_user(db, email, role="Planner", status="Active", password=None):
    user = models.User(
        name=email.split("@")[0], email=email, phone="1234567", department="Prod",
        role=role, status=status,
        password_hash=security.hash_password(password) if password else None,
    )
    db.add(user)
    db.commit()
    return user


# ------------------------------------------------------------------ migration
def test_migration_adds_column_and_keeps_existing_rows():
    path = Path(tempfile.mkdtemp()) / "old.db"
    raw = sqlite3.connect(path)
    raw.execute(
        "CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR NOT NULL, email VARCHAR NOT NULL UNIQUE,"
        " phone VARCHAR NOT NULL, department VARCHAR NOT NULL, role VARCHAR NOT NULL, status VARCHAR NOT NULL)"
    )
    raw.execute("INSERT INTO users VALUES (1,'Bob','bob@x.com','123','Prod','Supervisor','Active')")
    raw.commit()
    raw.close()

    engine = create_engine(f"sqlite:///{path}")
    migrations.ensure_schema(engine)
    migrations.ensure_schema(engine)  # running twice must be harmless

    columns = {c["name"] for c in inspect(engine).get_columns("users")}
    assert "password_hash" in columns

    with engine.connect() as conn:
        rows = conn.exec_driver_sql("SELECT name, password_hash FROM users").fetchall()
    assert rows == [("Bob", None)]


def test_migration_ignores_a_database_with_no_users_table():
    engine = create_engine(f"sqlite:///{Path(tempfile.mkdtemp()) / 'empty.db'}")
    migrations.ensure_schema(engine)  # no error


# ------------------------------------------------------------------- bootstrap
def test_bootstrap_gives_the_existing_admin_a_password_once(db):
    add_user(db, "planner@x.com", "Planner")
    admin = add_user(db, "boss@x.com", "Admin")
    messages = []

    password = bootstrap.ensure_initial_admin(db, log=messages.append)

    db.refresh(admin)
    assert security.verify_password(password, admin.password_hash)
    assert "boss@x.com" in messages[0] and password in messages[0]

    # Someone can sign in now, so a second start-up must change nothing.
    assert bootstrap.ensure_initial_admin(db, log=messages.append) is None
    assert len(messages) == 1  # nothing more was logged


def test_bootstrap_skips_inactive_admins_and_creates_a_new_one(db):
    add_user(db, "old@x.com", "Admin", status="Inactive")

    password = bootstrap.ensure_initial_admin(db, log=lambda m: None)

    created = db.query(models.User).filter(models.User.email == bootstrap.DEFAULT_ADMIN_EMAIL).one()
    assert created.role == "Admin" and created.status == "Active"
    assert security.verify_password(password, created.password_hash)
    old = db.query(models.User).filter(models.User.email == "old@x.com").one()
    assert old.password_hash is None  # the inactive admin was not revived


def test_bootstrap_uses_given_credentials_and_never_logs_the_password(db):
    messages = []
    bootstrap.ensure_initial_admin(db, email="Me@Example.com", password="my-chosen-password", log=messages.append)

    user = db.query(models.User).one()
    assert user.email == "Me@Example.com"
    assert security.verify_password("my-chosen-password", user.password_hash)
    assert all("my-chosen-password" not in m for m in messages)


# ---------------------------------------------------------------- admin safety
def test_cannot_remove_the_last_signed_in_admin(db):
    only = add_user(db, "a@x.com", "Admin", password="password-1")

    for kwargs in ({"deleting": True}, {"new_role": "Planner"}, {"new_status": "Inactive"}):
        with pytest.raises(HTTPException) as exc:
            rules.ensure_admin_remains(db, only, **kwargs)
        assert exc.value.status_code == 409

    rules.ensure_admin_remains(db, only, new_role="Admin", new_status="Active")  # unchanged: fine


def test_an_admin_without_a_password_does_not_count_as_a_backup(db):
    only = add_user(db, "a@x.com", "Admin", password="password-1")
    add_user(db, "b@x.com", "Admin", password=None)

    with pytest.raises(HTTPException):
        rules.ensure_admin_remains(db, only, deleting=True)


def test_admin_can_be_removed_when_another_can_sign_in(db):
    first = add_user(db, "a@x.com", "Admin", password="password-1")
    add_user(db, "b@x.com", "Admin", password="password-2")
    rules.ensure_admin_remains(db, first, deleting=True)


def test_non_admins_are_never_blocked(db):
    planner = add_user(db, "p@x.com", "Planner", password="password-1")
    rules.ensure_admin_remains(db, planner, deleting=True)


def test_email_uniqueness_ignores_case(db):
    user = add_user(db, "John123@Gmail.com")
    with pytest.raises(HTTPException) as exc:
        rules.ensure_unique_email(db, "john123@gmail.COM")
    assert exc.value.status_code == 409
    rules.ensure_unique_email(db, "JOHN123@gmail.com", exclude_id=user.id)
