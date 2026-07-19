from datetime import date

from pydantic import BaseModel, Field


class DonNghiViecCreate(BaseModel):
    ngayLamViecCuoi: date
    lyDoNghiViec: str = Field(min_length=1, max_length=255)
    noiDungBanGiao: str | None = Field(default=None, max_length=255)
    ghiChu: str | None = Field(default=None, max_length=255)


class QuyetDinhNghiViecCreate(BaseModel):
    soQuyetDinh: str = Field(min_length=1, max_length=50)
    ngayKy: date
    ngayHieuLuc: date
    nguoiKy: str = Field(min_length=1, max_length=150)
    lyDoNghiViec: str = Field(min_length=1, max_length=255)
    tepQuyetDinh: str | None = Field(default=None, max_length=255)
    id_DonNghiViec: str = Field(min_length=1, max_length=50)
    banHanh: bool = True
