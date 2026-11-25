from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    company_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    company_email = Column(String, nullable=False)

    admin_name = Column(String, nullable=False)
    admin_email = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    notifications = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=False)

    language = Column(String, default="English")