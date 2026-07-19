from datetime import datetime
from pydantic import BaseModel, Field


class CapPhatRequest(BaseModel):
    id_nhan_vien: str = Field(min_length=1, max_length=50)
    id_tai_san_list: list[str] = Field(min_length=1)
    ngay_cap_phat: datetime
    tinh_trang_ban_giao: str = Field(min_length=1, max_length=100)


class CapPhatItemResponse(BaseModel):
    id_GiaoNhan: str
    id_TaiSan: str
    id_NhanVien: str
    ngayCapPhat: datetime
    tinhTrangBanGiao: str
    trangThai: int


class ThuHoiRequest(BaseModel):
    ngay_thu_hoi: datetime
    tinh_trang_thu_hoi: str = Field(min_length=1, max_length=100)
    tep_bien_ban: str | None = Field(default=None, max_length=255)


class ThuHoiResponse(BaseModel):
    id_GiaoNhan: str
    id_TaiSan: str
    ngayThuHoi: datetime
    tinh_trang_thu_hoi: str
    tepBienBan: str | None
    can_luu_y: bool


class LichSuLuanChuyenItem(BaseModel):
    id_GiaoNhan: str
    id_TaiSan: str
    id_NhanVien: str
    ngayCapPhat: datetime
    tinhTrangBanGiao: str
    ngayThuHoi: datetime | None
    trangThai: int
    dang_su_dung: bool
    tinhTrangThuHoi: str | None = None
    tepBienBan: str | None = None
