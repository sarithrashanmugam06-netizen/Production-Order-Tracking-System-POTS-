from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    product_name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String, nullable=False)


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    current_stock = Column(Integer, default=0)
    minimum_stock = Column(Integer, default=10)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    department = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, nullable=False)
    # scrypt hash. Never returned by the API; NULL means the user cannot sign in yet.
    password_hash = Column(String, nullable=True)

class Issue(Base):

    __tablename__ = "issues"

    id = Column(Integer,primary_key=True,index=True)
    workorder_id = Column(Integer)
    issue_type = Column(String(100))
    description = Column(String(255))
    severity = Column(String(50))
    reported_date = Column(Date)
    status = Column(String(50))

    