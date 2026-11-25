"""Tiny schema upgrades for existing databases.

create_all() never alters a table that already exists, so a database created
before sign-in was added has no password_hash column. This adds it in place
and keeps all existing rows.
"""
from sqlalchemy import inspect, text


def ensure_schema(engine) -> None:
    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("users")}

    if "password_hash" not in columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))
