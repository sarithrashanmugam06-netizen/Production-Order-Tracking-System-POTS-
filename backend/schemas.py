from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

# Input models are strict. Response models (below) are deliberately lenient so
# that an older row in the database can never turn a read into a 500 error.


class _Strict(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class _Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------- products
class Product(_Strict):
    product_name: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=50)
    unit: str = Field(min_length=1, max_length=20)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)
    status: Literal["Active", "Inactive"]


class ProductResponse(_Response):
    id: int
    product_name: str
    category: str
    unit: str
    price: float
    quantity: int
    status: str


# ---------------------------------------------------------------- inventory
class Inventory(_Strict):
    product_id: int = Field(gt=0)
    current_stock: int = Field(ge=0)
    minimum_stock: int = Field(ge=0)


class InventoryResponse(_Response):
    id: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    current_stock: Optional[int] = None
    minimum_stock: Optional[int] = None


# ---------------------------------------------------------------- issues
class Issue(_Strict):
    workorder_id: int = Field(gt=0)
    issue_type: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=255)
    severity: Literal["High", "Medium", "Low"]
    reported_date: date
    status: Literal["Open", "In Progress", "Resolved"]


class IssueResponse(_Response):
    id: int
    workorder_id: Optional[int] = None
    issue_type: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    reported_date: Optional[date] = None
    status: Optional[str] = None
