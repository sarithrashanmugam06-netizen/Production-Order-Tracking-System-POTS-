from sqlalchemy import Column, Integer, String, Date
from database import Base


class Production(Base):
    __tablename__ = "production"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, nullable=False)

    production_line = Column(String, nullable=False)

    target_quantity = Column(Integer, nullable=False)

    produced_quantity = Column(Integer, nullable=False)

    production_date = Column(Date)

    status = Column(String)