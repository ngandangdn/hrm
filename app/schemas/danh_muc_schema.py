from datetime import datetime
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


class LichHopCreate(BaseModel):
    id_Phong: str = Field(min_length=1, max_length=50)
    tieuDe: str = Field(min_length=1, max_length=255)
    noiDung: str | None = None
    thoiGianBatDau: datetime
    thoiGianKetThuc: datetime
    mucDoUuTien: str = Field(default='normal', max_length=50)
    id_NhanVienThamGia: list[str] = Field(default_factory=list)


class LichHopXuLyRequest(BaseModel):
    lyDo: str | None = Field(default=None, max_length=255)


class ThanhVienLichHopResponse(BaseModel):
    id_LichHop: str
    id_NhanVien: str
    vaiTroThamGia: str
    trangThaiThamGia: str


class NhanVienOptionResponse(BaseModel):
    id_NhanVien: str
    hoTen: str
    email: str
    chucVu: str


class LichHopResponse(BaseModel):
    id_LichHop: str
    id_NhanVien: str
    id_Phong: str
    tieuDe: str
    noiDung: str | None
    thoiGianBatDau: datetime
    thoiGianKetThuc: datetime
    mucDoUuTien: str
    trangThai: int
    thanhVien: list[ThanhVienLichHopResponse] = Field(default_factory=list)
