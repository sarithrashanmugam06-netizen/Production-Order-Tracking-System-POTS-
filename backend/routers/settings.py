from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import access
import rules
from database import get_db
from settings_models import Settings
from settings_schemas import SettingsResponse, SettingsUpdate

router = APIRouter(
    prefix="/settings", tags=["Settings"], dependencies=[access.admin_only]
)


@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).first()

    # First run: create a single default row so the page always has data.
    if not settings:
        settings = Settings(
            company_name="ABC Manufacturing",
            industry="Manufacturing",
            location="Tamil Nadu",
            company_email="admin@company.com",
            admin_name="Admin User",
            admin_email="admin@company.com",
            phone="+91 9876543210",
            notifications=True,
            dark_mode=False,
            language="English",
        )

        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/{settings_id}", response_model=SettingsResponse)
def update_settings(
    settings_id: int,
    data: SettingsUpdate,
    db: Session = Depends(get_db),
):
    settings = rules.get_or_404(db, Settings, settings_id, "Settings")

    for key, value in data.model_dump().items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings
