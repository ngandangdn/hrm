from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class DoiTuongNhan(str, Enum):
    TOAN_CONG_TY = "TOAN_CONG_TY"
    PHONG_BAN = "PHONG_BAN"
    CA_NHAN = "CA_NHAN"


class ThongBaoCreate(BaseModel):
    tieuDe: str = Field(min_length=1, max_length=255)
    noiDung: str = Field(min_length=1)
    loaiThongBao: str = Field(min_length=1, max_length=50)
    doi_tuong_nhan: DoiTuongNhan
    id_nhan_vien_list: list[str] | None = None
    id_phong_ban_list: list[str] | None = None
    id_du_an_list: list[str] | None = None


class ThongBaoResponse(BaseModel):
    id_ThongBao: str
    id_NguoiNhan: str
    tieuDe: str
    noiDung: str
    loaiThongBao: str
    trangThaiDoc: int
    thoiGianGui: datetime
    id_doi_tuong_lien_quan: str | None = None


class ThongBaoUnreadCount(BaseModel):
    so_luong_chua_doc: int
