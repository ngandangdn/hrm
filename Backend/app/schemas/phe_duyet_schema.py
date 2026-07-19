from pydantic import BaseModel, Field


class PheDuyetRequest(BaseModel):
    ghiChu: str | None = Field(default=None, max_length=255)


class TuChoiRequest(BaseModel):
    ghiChu: str = Field(min_length=1, max_length=255)
