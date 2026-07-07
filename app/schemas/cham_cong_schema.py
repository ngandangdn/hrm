from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class BangCongPreviewItem(BaseModel):
    id_NhanVien: str
    tenBangCong: str
    loaiHinhTinhCong: str
    tongGioLogtime: Decimal | None = None
    tongGioLogtimeThucTe: Decimal | None = None
    tenDuAn_Task: str | None = None
    soLanDiMuon: int | None = 0
    tuNgay: date
    denNgay: date


class ImportPreviewResponse(BaseModel):
    preview_id: str
    tong_dong: int
    du_lieu: list[BangCongPreviewItem]


class ImportConfirmRequest(BaseModel):
    preview_id: str


class GiaiTrinhCongCreate(BaseModel):
    ngayGiaiTrinh: date
    lyDo: str = Field(min_length=1, max_length=255)
    id_BangCong: str | None = None


class TuChoiGiaiTrinhRequest(BaseModel):
    lyDoTuChoi: str = Field(min_length=1, max_length=255)


class DongYGiaiTrinhRequest(BaseModel):
    soGioCong: Decimal = Decimal("8")


class BangCongViewItem(BaseModel):
    id_BangCong: str
    id_NhanVien: str
    tenBangCong: str
    loaiHinhTinhCong: str
    trangThaiKy: str
    tuNgay: date
    denNgay: date
    tongGioLogtime: Decimal | None = None
    tongGioLogtimeThucTe: Decimal | None = None
    ngayCongQuyDoi: Decimal | None = None
    soLanDiMuon: int | None = None
    tenDuAn_Task: str | None = None
