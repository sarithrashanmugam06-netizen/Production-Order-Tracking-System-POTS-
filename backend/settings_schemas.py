from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class SettingsBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    company_name: str = Field(min_length=1, max_length=120)
    industry: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=120)
    company_email: str = Field(pattern=EMAIL_PATTERN)

    admin_name: str = Field(min_length=1, max_length=100)
    admin_email: str = Field(pattern=EMAIL_PATTERN)
    phone: str = Field(min_length=7, max_length=20)

    notifications: bool
    dark_mode: bool
    language: str = Field(min_length=1, max_length=30)


class SettingsCreate(SettingsBase):
    pass


class SettingsUpdate(SettingsBase):
    pass


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    industry: str
    location: str
    company_email: str
    admin_name: str
    admin_email: str
    phone: str
    notifications: bool
    dark_mode: bool
    language: str
