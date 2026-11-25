from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class WorkOrder(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    order_number: str = Field(min_length=1, max_length=50)
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)
    production_line: str = Field(min_length=1, max_length=50)
    start_date: date
    due_date: date
    priority: Literal["Low", "Medium", "High"]
    status: Literal["Pending", "Running", "Completed", "Delayed"]

    @model_validator(mode="after")
    def due_date_not_before_start(self):
        if self.due_date < self.start_date:
            raise ValueError("due_date cannot be earlier than start_date")
        return self


class WorkOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: Optional[int] = None
    production_line: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None
