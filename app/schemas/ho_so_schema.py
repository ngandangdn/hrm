from pydantic import BaseModel, Field


class ChiTietCapNhatItem(BaseModel):
    tenTruong: str = Field(min_length=1, max_length=100)
    nhomThongTin: str = Field(min_length=1, max_length=100)
    giaTriCu: str | None = Field(default=None, max_length=255)
    giaTriMoi: str = Field(min_length=1, max_length=255)
    ghiChu: str | None = Field(default=None, max_length=255)


class YeuCauCapNhatCreate(BaseModel):
    chiTiet: list[ChiTietCapNhatItem] = Field(min_length=1)
