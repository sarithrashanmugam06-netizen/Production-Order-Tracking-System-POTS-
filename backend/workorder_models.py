from sqlalchemy import Column, Integer, String, Date
from database import Base


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)

    order_number = Column(String, nullable=False)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)

    production_line = Column(String, nullable=False)

    start_date = Column(Date)
    due_date = Column(Date)

    priority = Column(String)
    status = Column(String)