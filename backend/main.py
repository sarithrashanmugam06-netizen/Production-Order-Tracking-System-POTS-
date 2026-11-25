import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

import bootstrap
import migrations
from database import Base, SessionLocal, engine, get_db

# Import models so SQLAlchemy knows about every table before create_all runs.
import models  # noqa: F401
import production_models  # noqa: F401
import settings_models  # noqa: F401
import workorder_models  # noqa: F401

from routers import (
    auth,
    inventory,
    issues,
    production,
    products,
    settings,
    users,
    workorders,
)

Base.metadata.create_all(bind=engine)
migrations.ensure_schema(engine)  # adds users.password_hash to older databases

with SessionLocal() as _db:
    bootstrap.ensure_initial_admin(_db)  # makes sure someone can sign in

app = FastAPI(title="Production Order Tracking System API")

# Comma-separated list, e.g. CORS_ORIGINS="https://pots.example.com"
# The defaults cover Vite's dev server whether you open it via localhost or 127.0.0.1.
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(inventory.router)
app.include_router(workorders.router)
app.include_router(users.router)
app.include_router(production.router)
app.include_router(issues.router)
app.include_router(settings.router)


@app.get("/")
def home():
    return {"message": "Production Order Tracking System API"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}
