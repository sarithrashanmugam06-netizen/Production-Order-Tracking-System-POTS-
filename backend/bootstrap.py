"""First-run setup: make sure someone can sign in.

If no user has a password yet (a fresh install, or a database from before
sign-in existed), one Admin gets a password:

  * ADMIN_EMAIL picks the account (default: the first active Admin already in
    the database, otherwise a new admin@pots.local).
  * ADMIN_PASSWORD sets the password. If it is not set, a random one is
    generated and printed to the server log ONCE.
"""
import os
import secrets
from typing import Callable, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import security

DEFAULT_ADMIN_EMAIL = "admin@pots.local"


def ensure_initial_admin(
    db: Session,
    email: Optional[str] = None,
    password: Optional[str] = None,
    log: Callable[[str], None] = print,
) -> Optional[str]:
    """Returns the password that was set, or None if nothing needed doing."""
    if db.query(models.User).filter(models.User.password_hash.isnot(None)).first():
        return None

    email = email or os.getenv("ADMIN_EMAIL")
    password_given = password or os.getenv("ADMIN_PASSWORD")

    if email:
        admin = (
            db.query(models.User)
            .filter(func.lower(models.User.email) == email.lower())
            .first()
        )
    else:
        admin = (
            db.query(models.User)
            .filter(models.User.role == "Admin", models.User.status == "Active")
            .order_by(models.User.id)
            .first()
        )

    if admin is None:
        admin = models.User(
            name="Administrator",
            email=email or DEFAULT_ADMIN_EMAIL,
            phone="0000000000",
            department="Management",
            role="Admin",
            status="Active",
        )
        db.add(admin)

    admin.role = "Admin"
    admin.status = "Active"

    final_password = password_given or secrets.token_urlsafe(9)
    admin.password_hash = security.hash_password(final_password)
    db.commit()

    if password_given:
        log(f"[POTS] Admin account ready: {admin.email} (password from ADMIN_PASSWORD).")
    else:
        log(
            "[POTS] First run: sign in as "
            f"{admin.email} with password {final_password}\n"
            "[POTS] This password is shown only once. Change it from the Users page."
        )

    return final_password
