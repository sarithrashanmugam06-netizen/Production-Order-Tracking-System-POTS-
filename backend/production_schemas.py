from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class Production(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    product_id: int = Field(gt=0)
    production_line: str = Field(min_length=1, max_length=50)
    target_quantity: int = Field(gt=0)
    produced_quantity: int = Field(ge=0)
    production_date: date
    status: Literal["Pending", "Running", "Completed", "Delayed"]


class ProductionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    production_line: Optional[str] = None
    target_quantity: Optional[int] = None
    produced_quantity: Optional[int] = None
    production_date: Optional[date] = None
    status: Optional[str] = None
