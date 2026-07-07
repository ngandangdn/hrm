from pydantic import BaseModel, Field


class PhongHopCreate(BaseModel):
    id_Phong: str = Field(min_length=1, max_length=50)
    tenPhong: str = Field(min_length=1, max_length=150)
    sucChua: int = Field(gt=0)
    trangThai: int = 1
    moTa: str | None = Field(default=None, max_length=255)


class PhongHopUpdate(BaseModel):
    tenPhong: str | None = Field(default=None, min_length=1, max_length=150)
    sucChua: int | None = Field(default=None, gt=0)
    trangThai: int | None = None
    moTa: str | None = Field(default=None, max_length=255)
