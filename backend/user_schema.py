from typing import Annotated, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# Text fields are trimmed individually (not via model config) so that passwords
# are NEVER altered: what is typed at login must equal what was saved.
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Email = Annotated[str, StringConstraints(strip_whitespace=True, pattern=EMAIL_PATTERN, max_length=120)]
Phone = Annotated[str, StringConstraints(strip_whitespace=True, min_length=7, max_length=20)]
Department = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]

Role = Literal["Admin", "Planner", "Supervisor", "Management"]
Status = Literal["Active", "Inactive"]


class UserBase(BaseModel):
    name: Name
    email: Email
    phone: Phone
    department: Department
    role: Role
    status: Status


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(UserBase):
    # Leave out (or null) to keep the current password.
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str
    department: str
    role: str
    status: str
    # password_hash is intentionally not part of any response model.


class LoginRequest(BaseModel):
    email: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
