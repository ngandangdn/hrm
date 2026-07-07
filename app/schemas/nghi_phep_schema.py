from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class DonNghiPhepCreate(BaseModel):
    loaiPhep: str = Field(min_length=1, max_length=100)
    tuNgay: date
    denNgay: date
    lyDo: str = Field(min_length=1, max_length=255)
    id_QuyPhep: str = Field(min_length=1, max_length=50)


class DuyetDonRequest(BaseModel):
    ghiChu: str | None = Field(default=None, max_length=255)


class TuChoiDonRequest(BaseModel):
    lyDoTuChoi: str = Field(min_length=1, max_length=255)


class BangPhepItem(BaseModel):
    id_QuyPhep: str
    id_NhanVien: str
    nam: int
    tongQuyPhep: Decimal
    soNgayDaDung: Decimal
    soNgayChoDuyet: Decimal
    so_ngay_con_lai: Decimal
    trangThai: int


class DonNghiPhepResponse(BaseModel):
    id_DonPhep: str
    loaiPhep: str
    ngayTao: datetime
    tuNgay: date
    denNgay: date
    so_ngay_nghi: Decimal
    trangThai: int
    lyDo: str
    lyDoTuChoi: str | None
    thoiGianDuyet: datetime | None
    nguoiDuyet: str
    id_NhanVien: str | None
    id_QuyPhep: str
    co_the_huy: bool = False


class DonNghiPhepDetail(BaseModel):
    don: DonNghiPhepResponse
    lich_su_xu_ly: dict[str, object]
